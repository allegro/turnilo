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

import { Set } from "immutable";
import { $, Dataset, r, SortExpression } from "plywood";
import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Colors } from "../../../common/models/colors/colors";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { FilterClause, StringFilterAction, StringFilterClause } from "../../../common/models/filter-clause/filter-clause";
import { Filter, FilterMode } from "../../../common/models/filter/filter";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { collect, Fn } from "../../../common/utils/general/general";
import { SEARCH_WAIT, STRINGS } from "../../config/constants";
import { classNames, enterKey } from "../../utils/dom/dom";
import { Button } from "../button/button";
import { Checkbox, CheckboxType } from "../checkbox/checkbox";
import { GlobalEventListener } from "../global-event-listener/global-event-listener";
import { HighlightString } from "../highlight-string/highlight-string";
import { Loader } from "../loader/loader";
import { QueryError } from "../query-error/query-error";
import "./selectable-string-filter-menu.scss";

const TOP_N = 100;

export interface SelectableStringFilterMenuProps {
  clicker: Clicker;
  dimension: Dimension;
  essence: Essence;
  timekeeper: Timekeeper;
  onClose: Fn;
  filterMode?: FilterMode;
  searchText: string;
  onClauseChange: (clause: FilterClause) => Filter;
}

export interface SelectableStringFilterMenuState {
  loading?: boolean;
  dataset?: Dataset;
  error?: any;
  fetchQueued?: boolean;
  selectedValues?: Set<string>;
  promotedValues?: Set<string>; // initial selected values
  colors?: Colors;
}

function toggle(set: Set<string>, value: string): Set<string> {
  return set.has(value) ? set.remove(value) : set.add(value);
}

export class SelectableStringFilterMenu extends React.Component<SelectableStringFilterMenuProps, SelectableStringFilterMenuState> {
  public mounted: boolean;
  public collectTriggerSearch: Fn;

  constructor(props: SelectableStringFilterMenuProps) {
    super(props);
    this.state = {
      loading: false,
      dataset: null,
      error: null,
      fetchQueued: false,
      selectedValues: null,
      promotedValues: null,
      colors: null
    };

    this.collectTriggerSearch = collect(SEARCH_WAIT, () => {
      if (!this.mounted) return;
      const { essence, timekeeper, dimension, searchText } = this.props;
      this.fetchData(essence, timekeeper, dimension, searchText);
    });
  }

  fetchData(essence: Essence, timekeeper: Timekeeper, dimension: Dimension, searchText: string): void {
    const { dataCube } = essence;
    const nativeCount = dataCube.getMeasure("count");
    const $main = $("main");
    const measureExpression = nativeCount ? nativeCount.expression : $main.count();

    let filterExpression = essence.getEffectiveFilter(timekeeper, { unfilterDimension: dimension }).toExpression();

    if (searchText) {
      filterExpression = filterExpression.and(dimension.expression.contains(r(searchText), "ignoreCase"));
    }

    const query = $main
      .filter(filterExpression)
      .split(dimension.expression, dimension.name)
      .apply("MEASURE", measureExpression)
      .sort($("MEASURE"), SortExpression.DESCENDING)
      .limit(TOP_N + 1);

    this.setState({
      loading: true,
      fetchQueued: false
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

  componentWillMount() {
    const { essence, dimension } = this.props;
    const { filter, colors } = essence;

    const myColors = (colors && colors.dimension === dimension.name ? colors : null);

    const existingMode = filter.getModeForDimension(dimension);

    const clause = filter.getClauseForDimension(dimension);
    if (!clause) {
      return this.initComponent(Set.of(), myColors);
    }
    if (!(clause instanceof StringFilterClause)) {
      throw new Error(`Expected string filter clause, got: ${clause}`);
    }
    const valueSet = clause.values;
    const nonRegexValues = (existingMode !== FilterMode.REGEX && valueSet);
    const valuesFromColors = (myColors ? Set(myColors.toArray()) : Set.of());
    const selectedValues = nonRegexValues || valuesFromColors; // don't want regex to show up as a promoted value

    this.initComponent(selectedValues, myColors);
  }

  private initComponent(selectedValues: Set<string>, colors: Colors) {
    const { essence, timekeeper, dimension, searchText } = this.props;
    this.setState({
      selectedValues,
      promotedValues: selectedValues,
      colors
    });

    this.fetchData(essence, timekeeper, dimension, searchText);
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps: SelectableStringFilterMenuProps) {
    const { searchText } = this.props;
    const { fetchQueued, loading, dataset } = this.state;
    // If the user is just typing in more and there are already < TOP_N results then there is nothing to do
    if (nextProps.searchText && nextProps.searchText.indexOf(searchText) !== -1 && !fetchQueued && !loading && dataset && dataset.data.length < TOP_N) {
      return;
    } else {
      this.setState({
        fetchQueued: true
      });
      this.collectTriggerSearch();
    }
  }

  globalKeyDownListener = (e: KeyboardEvent) => {
    if (enterKey(e)) {
      this.onOkClick();
    }
  }

  constructFilter(): Filter {
    const { dimension, filterMode, onClauseChange } = this.props;
    const { selectedValues } = this.state;
    const { name } = dimension;
    if (selectedValues.count() === 0) return onClauseChange(null);

    const clause = new StringFilterClause({
      action: StringFilterAction.IN,
      reference: name,
      values: selectedValues,
      not: filterMode === FilterMode.EXCLUDE
    });
    return onClauseChange(clause);
  }

  onValueClick(value: any, e: MouseEvent) {
    const { selectedValues, colors: oldColors } = this.state;
    const colors = oldColors && oldColors.toggle(value);
    if (e.altKey || e.ctrlKey || e.metaKey) {
      const isValueSingleSelected = selectedValues.contains(value) && selectedValues.count() === 1;
      return this.setState({ colors, selectedValues: isValueSingleSelected ? Set.of() : Set.of(value) });
    }
    return this.setState({ colors, selectedValues: toggle(selectedValues, value) });
  }

  onOkClick = () => {
    if (!this.actionEnabled()) return;
    const { clicker, onClose } = this.props;
    const { colors } = this.state;
    clicker.changeFilter(this.constructFilter(), colors);
    onClose();
  }

  onCancelClick = () => {
    this.props.onClose();
  }

  actionEnabled() {
    return !this.props.essence.filter.equals(this.constructFilter());
  }

  renderList() {
    const rows = this.renderRows();
    const message = this.renderMessage(rows.length > 0);

    return <div className="rows">
      {rows}
      {message}
    </div>;
  }

  private renderMessage(hasRows: boolean) {
    const { searchText } = this.props;
    const { loading, dataset, fetchQueued } = this.state;
    if (loading || !dataset || fetchQueued || !searchText || hasRows) {
      return null;
    }
    return <div className="message">{'No results for "' + searchText + '"'}</div>;
  }

  private renderRows() {
    const { dataset, selectedValues, promotedValues } = this.state;
    if (!dataset) return [];
    const { dimension, filterMode, searchText } = this.props;
    const promotedElements = promotedValues ? promotedValues.toArray() : [];
    const rowData = dataset.data.slice(0, TOP_N).filter(d => {
      return promotedElements.indexOf(d[dimension.name] as string) === -1;
    });
    let rowStrings = promotedElements.concat(rowData.map(d => d[dimension.name] as string));

    if (searchText) {
      const searchTextLower = searchText.toLowerCase();
      rowStrings = rowStrings.filter(d => {
        return String(d).toLowerCase().indexOf(searchTextLower) !== -1;
      });
    }

    const checkboxType = filterMode === FilterMode.EXCLUDE ? "cross" : "check";
    return rowStrings.map(segmentValue => {
      const segmentValueStr = String(segmentValue);
      const selected = selectedValues && selectedValues.contains(segmentValue);

      return <div
        className={classNames("row", { selected })}
        key={segmentValueStr}
        title={segmentValueStr}
        onClick={this.onValueClick.bind(this, segmentValue)}
      >
        <div className="row-wrapper">
          <Checkbox type={checkboxType as CheckboxType} selected={selected} />
          <HighlightString className="label" text={segmentValueStr} highlight={searchText} />
        </div>
      </div>;
    });
  }

  render() {
    const { filterMode } = this.props;
    const { dataset, loading, error } = this.state;

    const hasMore = dataset && dataset.data.length > TOP_N;
    return <div className={classNames("string-filter-menu", filterMode)}>
      <GlobalEventListener
        keyDown={this.globalKeyDownListener}
      />
      <div className={classNames("menu-table", hasMore ? "has-more" : "no-more")}>
        {this.renderList()}
        {error ? <QueryError error={error} /> : null}
        {loading ? <Loader /> : null}
      </div>
      <div className="ok-cancel-bar">
        <Button type="primary" title={STRINGS.ok} onClick={this.onOkClick} disabled={!this.actionEnabled()} />
        <Button type="secondary" title={STRINGS.cancel} onClick={this.onCancelClick} />
      </div>
    </div>;
  }
}
