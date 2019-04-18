/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2018 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Duration } from "chronoshift";
import { $, Dataset, Datum, NumberRange, PlywoodValue, r, SortExpression, TimeRange } from "plywood";
import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Colors } from "../../../common/models/colors/colors";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { isTimeFilter, NumberFilterClause, StringFilterClause } from "../../../common/models/filter-clause/filter-clause";
import { clausePredicate } from "../../../common/models/filter-clause/filter-clause-predicate";
import {
  ContinuousDimensionKind,
  getBestGranularityForRange,
  getDefaultGranularityForKind
} from "../../../common/models/granularity/granularity";
import { SortOn } from "../../../common/models/sort-on/sort-on";
import { Bucket, bucketToAction } from "../../../common/models/split/split";
import { TimeShiftEnvType } from "../../../common/models/time-shift/time-shift-env";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { formatNumberRange } from "../../../common/utils/formatter/formatter";
import { Unary } from "../../../common/utils/functional/functional";
import { collect, Fn } from "../../../common/utils/general/general";
import { formatTimeRange } from "../../../common/utils/time/time";
import { MAX_SEARCH_LENGTH, PIN_ITEM_HEIGHT, PIN_PADDING_BOTTOM, PIN_TITLE_HEIGHT, SEARCH_WAIT } from "../../config/constants";
import { classNames } from "../../utils/dom/dom";
import { Checkbox } from "../checkbox/checkbox";
import "../dimension-tile/dimension-tile.scss";
import { HighlightString } from "../highlight-string/highlight-string";
import { Loader } from "../loader/loader";
import { Message } from "../message/message";
import { QueryError } from "../query-error/query-error";
import { SearchableTile } from "../searchable-tile/searchable-tile";
import { SvgIcon } from "../svg-icon/svg-icon";
import { TileHeaderIcon } from "../tile-header/tile-header";

export interface DimensionTileProps {
  clicker: Clicker;
  essence: Essence;
  timekeeper: Timekeeper;
  dimension: Dimension;
  sortOn: SortOn;
  colors: Colors;
}

export interface DimensionTileState {
  loading: boolean;
  dataset: Dataset | null;
  error: Error | null;
  fetchQueued: boolean;
  unfolded: boolean;
  showSearch: boolean;
  searchText: string;
}

export class LegendContent extends React.Component<DimensionTileProps, DimensionTileState> {

  private static readonly TOP_N = 100;
  private static readonly FOLDER_BOX_HEIGHT = 30;

  public mounted: boolean;
  public collectTriggerSearch: Fn;

  constructor(props: DimensionTileProps) {
    super(props);
    this.state = {
      loading: false,
      dataset: null,
      error: null,
      fetchQueued: false,
      unfolded: true,
      showSearch: false,
      searchText: ""
    };

    this.collectTriggerSearch = collect(SEARCH_WAIT, () => {
      if (!this.mounted) return;
      this.fetchData();
    });

  }

  private bucketForDimension(essence: Essence, dimension: Dimension): Bucket {
    const split = essence.splits.findSplitForDimension(dimension);
    return split.bucket;
  }

  fetchData(): void {
    const { essence, timekeeper, dimension, sortOn } = this.props;

    if (!sortOn) {
      this.setState({
        loading: false,
        dataset: null,
        error: null
      });
      return;
    }

    const { unfolded, searchText } = this.state;
    const { dataCube, colors } = essence;

    let filter = essence.getEffectiveFilter(timekeeper);
    console.log(filter.toJS());
    // don't remove filter if time
    // if (unfolded && dimension !== essence.getTimeDimension()) {
    //   filter = filter.removeClause(dimension.name);
    // }

    filter = filter.setExclusionForDimension(false, dimension);

    let filterExpression = filter.toExpression(dataCube);

    const shouldFoldRows = !unfolded && colors && colors.dimension === dimension.name && colors.values;

    if (shouldFoldRows) {
      filterExpression = filterExpression.and(dimension.expression.in(colors.toSet()));
    }

    if (searchText) {
      filterExpression = filterExpression.and(dimension.expression.contains(r(searchText), "ignoreCase"));
    }

    let query: any = $("main")
      .filter(filterExpression);

    if (dimension.canBucketByDefault()) {
      query = query.split($(dimension.name).performAction(bucketToAction(this.bucketForDimension(essence, dimension))), dimension.name);
    } else {
      query = query.split(dimension.expression, dimension.name);

    }

    const sortSeries = essence.findConcreteSeries(sortOn.key);
    if (sortSeries) {
      query = query.performAction(sortSeries.plywoodExpression(0, { type: TimeShiftEnvType.CURRENT }));
    }

    const sortExpression = $(sortOn.key);
    query = query.sort(sortExpression, SortExpression.DESCENDING).limit(LegendContent.TOP_N + 1);

    this.setState({
      loading: true,
      error: null,
      fetchQueued: false,
      dataset: null
    });
    dataCube.executor(query, { timezone: essence.timezone })
      .then(
        (dataset: Dataset) => {
          if (!this.mounted) return;
          this.setState({
            loading: false,
            dataset,
            error: null
          });
        },
        error => {
          if (!this.mounted) return;
          this.setState({
            loading: false,
            dataset: null,
            error
          });
        }
      );
  }

  componentDidUpdate(prevProps: DimensionTileProps) {
    const { essence, timekeeper, dimension, sortOn } = prevProps;
    const { essence: nextEssence, timekeeper: nextTimekeeper, dimension: nextDimension, sortOn: nextSortOn } = this.props;
    const { unfolded } = this.state;

    // keep granularity selection if measures change or if autoupdate
    const currentSelection = essence.getTimeClause();
    const nextSelection = nextEssence.getTimeClause();
    const differentTimeFilterSelection = currentSelection ? !currentSelection.equals(nextSelection) : Boolean(nextSelection);
    if (differentTimeFilterSelection) {
      // otherwise render will try to format exiting dataset based off of new granularity (before fetchData returns)
      this.setState({ dataset: null });
    }

    if (
      essence.differentDataCube(nextEssence) ||
      essence.differentEffectiveFilter(nextEssence, timekeeper, nextTimekeeper) ||
      essence.differentColors(nextEssence) ||
      essence.differentSplits(nextEssence) ||
      !dimension.equals(nextDimension) ||
      !SortOn.equals(sortOn, nextSortOn) ||
      (!essence.timezone.equals(nextEssence.timezone)) && dimension.kind === "time" ||
      differentTimeFilterSelection
    ) {

      this.fetchData();
    }
  }

  componentDidMount() {
    this.mounted = true;
    this.fetchData();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onRowClick(value: any) {
    const { clicker, dimension } = this.props;
    const { dataset } = this.state;

    let { colors } = this.props;

    if (colors && colors.dimension === dimension.name) {
      if (colors.limit) {
        if (!dataset) return;
        const values = dataset.data.slice(0, colors.limit).map(d => d[dimension.name]);
        colors = Colors.fromValues(colors.dimension, values);
      }
      colors = colors.toggle(value);

      clicker.changeColors(colors);
    }
  }

  toggleFold = () => {
    let { unfolded } = this.state;
    unfolded = !unfolded;
    this.setState(({ unfolded }), () => {
      this.fetchData();
    });
  }

  toggleSearch = () => {
    this.setState(({ showSearch }) => ({ showSearch: !showSearch }));
    this.onSearchChange("");
  }

  onSearchChange = (text: string) => {
    const { searchText, dataset, fetchQueued, loading } = this.state;
    const newSearchText = text.substr(0, MAX_SEARCH_LENGTH);

    if (searchText === newSearchText) return; // nothing to do;

    // If the user is just typing in more and there are already < TOP_N results then there is nothing to do
    if (newSearchText.indexOf(searchText) !== -1 && !fetchQueued && !loading && dataset && dataset.data.length < LegendContent.TOP_N) {
      this.setState({
        searchText: newSearchText
      });
      return;
    }

    this.setState({
      searchText: newSearchText,
      fetchQueued: true
    });
    this.collectTriggerSearch();
  }

  private prepareRowsData(): Datum[] {
    const { dimension } = this.props;
    const { dataset, searchText } = this.state;

    if (dataset) {
      let rowData = dataset.data.slice(0, LegendContent.TOP_N);

      if (searchText) {
        const searchTextLower = searchText.toLowerCase();
        rowData = rowData.filter(d => {
          return String(d[dimension.name]).toLowerCase().indexOf(searchTextLower) !== -1;
        });
      }

      return rowData;
    } else {
      return [];
    }
  }

  private prepareColorValues(colors: Colors, dimension: Dimension, rowData: Datum[]): string[] {
    return colors.getColors(rowData.map(d => d[dimension.name]));
  }

  private getFormatter(): Unary<Datum, string> {
    const { sortOn, essence } = this.props;

    const series = sortOn && essence.findConcreteSeries(sortOn.key);
    if (!series) return null;
    return d => series.formatValue(d);
  }

  private prepareRows(rowData: Datum[]): JSX.Element[] {
    const { dimension, colors } = this.props;
    const { searchText } = this.state;

    const colorValues = this.prepareColorValues(colors, dimension, rowData);
    const formatter = this.getFormatter();

    return rowData.map((datum, i) => {
      const segmentValue = datum[dimension.name];

      let className = "row color";
      let selected = false;
      let checkbox = <Checkbox
        selected={selected}
        type="check"
        color={colorValues ? colorValues[i] : null}
      />;

      const segmentValueStr = this.getSegmentValueString(segmentValue as PlywoodValue);

      return <div
        className={className}
        key={segmentValueStr}
        onClick={this.onRowClick.bind(this, segmentValue)}
      >
        <div className="segment-value" title={segmentValueStr}>
          {checkbox}
          <HighlightString className="label" text={segmentValueStr} highlight={searchText} />
        </div>
        {formatter && <div className="measure-value">{formatter(datum)}</div>}
      </div>;
    });
  }

  private getSegmentValueString(segmentValue: PlywoodValue): string {
    const { essence: { timezone } } = this.props;
    const segmentValueStr = String(segmentValue);

    if (segmentValue instanceof TimeRange) {
      return formatTimeRange(segmentValue, timezone);
    }
    if (segmentValue instanceof NumberRange) {
      return formatNumberRange(segmentValue);
    }
    return segmentValueStr;
  }

  private prepareFoldControl(): JSX.Element {
    return <div
      className={classNames("folder", this.state.unfolded ? "folded" : "unfolded")}
      onClick={this.toggleFold}
    >
      <SvgIcon svg={require("../../icons/caret.svg")} />
      {this.state.unfolded ? "Show selection" : "Show all"}
    </div>;
  }

  private calculateTileHeight(rowsCount: int): number {
    const titleAndPaddingHeight = PIN_TITLE_HEIGHT + PIN_PADDING_BOTTOM;
    const rowsHeightWithPaddingAndTitle = Math.max(2, rowsCount) * PIN_ITEM_HEIGHT + titleAndPaddingHeight;

    return rowsHeightWithPaddingAndTitle + LegendContent.FOLDER_BOX_HEIGHT;
  }

  render() {
    const { sortOn, colors, dimension } = this.props;
    const { loading, dataset, error, showSearch, fetchQueued, searchText } = this.state;

    const rowsData = this.prepareRowsData();
    const rows = this.prepareRows(rowsData);

    let message: JSX.Element = null;
    if (!loading && dataset && !fetchQueued && searchText && !rows.length) {
      message = <div className="message">{`No results for "${searchText}"`}</div>;
    }

    const className = classNames(
      "dimension-tile",
      "has-folder",
      (colors ? "has-colors" : "no-colors")
    );

    const maxHeight = this.calculateTileHeight(rows.length);
    const style = {
      maxHeight
    };

    const icons: TileHeaderIcon[] = [{
      name: "search",
      ref: "search",
      onClick: this.toggleSearch,
      svg: require("../../icons/full-search.svg"),
      active: showSearch
    }];

    return <SearchableTile
      style={style}
      title={dimension.title}
      toggleChangeFn={this.toggleSearch}
      onSearchChange={this.onSearchChange}
      searchText={searchText}
      showSearch={showSearch}
      icons={icons}
      className={className}>
      <div className="rows">
        {rows}
        {message}
      </div>
      {this.prepareFoldControl()}
      {error && <QueryError error={error} />}
      {!sortOn && <Message content="No measure selected"/>}
      {loading && <Loader />}
    </SearchableTile>;
  }
}
