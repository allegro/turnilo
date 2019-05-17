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
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { FilterClause, StringFilterAction, StringFilterClause } from "../../../common/models/filter-clause/filter-clause";
import { Filter, FilterMode } from "../../../common/models/filter/filter";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { collect, Fn } from "../../../common/utils/general/general";
import { SEARCH_WAIT, STRINGS } from "../../config/constants";
import { classNames, enterKey } from "../../utils/dom/dom";
import { Button } from "../button/button";
import { GlobalEventListener } from "../global-event-listener/global-event-listener";
import { HighlightString } from "../highlight-string/highlight-string";
import { Loader } from "../loader/loader";
import { QueryError } from "../query-error/query-error";
import "./preview-string-filter-menu.scss";

const TOP_N = 100;

export interface PreviewStringFilterMenuProps {
  clicker: Clicker;
  dimension: Dimension;
  essence: Essence;
  timekeeper: Timekeeper;
  onClose: Fn;
  filterMode: FilterMode.REGEX | FilterMode.CONTAINS;
  searchText: string;
  onClauseChange: (clause: FilterClause) => Filter;
}

export interface PreviewStringFilterMenuState {
  loading?: boolean;
  dataset?: Dataset;
  queryError?: any;
  fetchQueued?: boolean;
  regexErrorMessage?: string;
}

export class PreviewStringFilterMenu extends React.Component<PreviewStringFilterMenuProps, PreviewStringFilterMenuState> {
  public mounted: boolean;
  public collectTriggerSearch: Fn;

  constructor(props: PreviewStringFilterMenuProps) {
    super(props);
    this.state = {
      loading: false,
      dataset: null,
      queryError: null,
      fetchQueued: false,
      regexErrorMessage: ""
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
    const measureExpression = nativeCount ? nativeCount.expression : $("main").count();

    let filterExpression = essence.getEffectiveFilter(timekeeper, { unfilterDimension: dimension }).toExpression(dataCube);

    if (searchText) {
      const { filterMode } = this.props;
      if (filterMode === FilterMode.CONTAINS) {
        filterExpression = filterExpression.and(dimension.expression.contains(r(searchText)));
      } else if (filterMode === FilterMode.REGEX) {
        filterExpression = filterExpression.and(dimension.expression.match(searchText));
      }
    }

    const query = $("main")
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
            queryError: null
          });
        },
        error => {
          if (!this.mounted) return;
          this.setState({
            loading: false,
            dataset: null,
            queryError: error
          });
        }
      );
  }

  componentWillMount() {
    const { essence, timekeeper, dimension, searchText, filterMode } = this.props;
    if (searchText && filterMode === FilterMode.REGEX && !this.checkRegex(searchText)) return;
    this.fetchData(essence, timekeeper, dimension, searchText);
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps: PreviewStringFilterMenuProps) {
    const { searchText, filterMode } = this.props;
    const incomingSearchText = nextProps.searchText;
    const { fetchQueued, loading, dataset } = this.state;
    if (incomingSearchText && filterMode === FilterMode.REGEX) this.checkRegex(incomingSearchText);

    // If the user is just typing in more and there are already < TOP_N results then there is nothing to do
    if (incomingSearchText && incomingSearchText.indexOf(searchText) !== -1 && !fetchQueued && !loading && dataset && dataset.data.length < TOP_N) {
      return;
    } else {
      this.setState({
        fetchQueued: true
      });
      this.collectTriggerSearch();
    }
  }

  checkRegex(text: string): boolean {
    try {
      new RegExp(text);
      this.setState({ regexErrorMessage: null });
    } catch (e) {
      this.setState({ regexErrorMessage: e.message });
      return false;
    }
    return true;
  }

  globalKeyDownListener = (e: KeyboardEvent) => {
    if (enterKey(e)) {
      this.onOkClick();
    }
  }

  constructFilter(): Filter {
    const { dimension, filterMode, onClauseChange, searchText } = this.props;
    if (!searchText) return null;

    const { name: reference } = dimension;

    switch (filterMode) {
      case FilterMode.CONTAINS:
        return onClauseChange(new StringFilterClause({
          reference,
          values: Set.of(searchText),
          action: StringFilterAction.CONTAINS
        }));
      case FilterMode.REGEX:
        return onClauseChange(new StringFilterClause({
          reference,
          values: Set.of(searchText),
          action: StringFilterAction.MATCH
        }));
    }
  }

  onOkClick = () => {
    if (!this.actionEnabled()) return;
    const { clicker, onClose } = this.props;
    clicker.changeFilter(this.constructFilter());
    onClose();
  }

  onCancelClick = () => {
    this.props.onClose();
  }

  actionEnabled() {
    const { regexErrorMessage } = this.state;
    const { essence } = this.props;
    if (regexErrorMessage) return false;
    const newFilter = this.constructFilter();
    return newFilter && !essence.filter.equals(newFilter);
  }

  renderList() {
    const { searchText } = this.props;
    const rows = this.renderRows();
    const grayMessage = this.renderMessage(rows.length > 0);

    return <div className="rows">
      {(rows.length === 0 || !searchText) ? null : <div className="matching-values-message">Matching Values</div>}
      {rows}
      {grayMessage}
    </div>;
  }

  private renderMessage(hasRows: boolean) {
    const { loading, dataset, fetchQueued, regexErrorMessage } = this.state;
    const { searchText } = this.props;
    if (regexErrorMessage) {
      return <div className="message">{regexErrorMessage}</div>;
    }
    if (!loading && dataset && !fetchQueued && searchText && !hasRows) {
      return <div className="message">{'No results for "' + searchText + '"'}</div>;
    }
    return null;
  }

  private renderRows() {
    const { dataset } = this.state;
    if (!dataset) {
      return [];
    }

    const { dimension, searchText, filterMode } = this.props;
    let search: string | RegExp = null;
    let rowStrings = dataset.data.slice(0, TOP_N).map(d => d[dimension.name]);

    if (searchText) {
      rowStrings = rowStrings.filter(d => {
        if (filterMode === FilterMode.REGEX) {
          try {
            const escaped = searchText.replace(/\\[^\\]]/g, "\\\\");
            search = new RegExp(escaped);
            return search.test(String(d));
          } catch (e) {
            return false;
          }
        } else if (filterMode === FilterMode.CONTAINS) {
          search = searchText;
          return String(d).indexOf(searchText) !== -1;
        }
        return false;
      });
    }

    return rowStrings.map(segmentValue => {
      const segmentValueStr = String(segmentValue);
      return <div
        className="row no-select"
        key={segmentValueStr}
        title={segmentValueStr}
      >
        <div className="row-wrapper">
          <HighlightString className="label" text={segmentValueStr} highlight={search} />
        </div>
      </div>;
    });
  }

  render() {
    const { filterMode } = this.props;
    const { dataset, loading, queryError } = this.state;

    const hasMore = dataset && dataset.data.length > TOP_N;
    return <div className={classNames("string-filter-menu", filterMode)}>
      <GlobalEventListener
        keyDown={this.globalKeyDownListener}
      />
      <div className={classNames("menu-table", hasMore ? "has-more" : "no-more")}>
        {this.renderList()}
        {queryError ? <QueryError error={queryError} /> : null}
        {loading ? <Loader /> : null}
      </div>
      <div className="ok-cancel-bar">
        <Button type="primary" title={STRINGS.ok} onClick={this.onOkClick} disabled={!this.actionEnabled()} />
        <Button type="secondary" title={STRINGS.cancel} onClick={this.onCancelClick} />
      </div>
    </div>;
  }
}
