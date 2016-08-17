/*
 * Copyright 2015-2016 Imply Data, Inc.
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

require('./preview-string-filter-menu.css');

import * as React from "react";
import { $, Dataset, SortAction, r } from "plywood";
import { Fn, collect } from "../../../common/utils/general/general";
import { STRINGS, SEARCH_WAIT } from "../../config/constants";
import { Clicker, Essence, Filter, FilterClause, FilterMode, Dimension } from "../../../common/models/index";
import { enterKey, classNames } from "../../utils/dom/dom";
import { Loader } from "../loader/loader";
import { QueryError } from "../query-error/query-error";
import { HighlightString } from "../highlight-string/highlight-string";
import { Button } from "../button/button";
import { GlobalEventListener } from "../global-event-listener/global-event-listener";

const TOP_N = 100;

export interface PreviewStringFilterMenuProps extends React.Props<any> {
  clicker: Clicker;
  dimension: Dimension;
  essence: Essence;
  onClose: Fn;
  filterMode: FilterMode;
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

  constructor() {
    super();
    this.state = {
      loading: false,
      dataset: null,
      queryError: null,
      fetchQueued: false,
      regexErrorMessage: ""
    };

    this.collectTriggerSearch = collect(SEARCH_WAIT, () => {
      if (!this.mounted) return;
      var { essence, dimension, searchText } = this.props;
      this.fetchData(essence, dimension, searchText);
    });
  }

  fetchData(essence: Essence, dimension: Dimension, searchText: string): void {
    var { dataCube } = essence;
    var nativeCount = dataCube.getMeasure('count');
    var measureExpression = nativeCount ? nativeCount.expression : $('main').count();

    var filterExpression = essence.getEffectiveFilter(null, dimension).toExpression();

    var query = $('main')
      .filter(filterExpression)
      .split(dimension.expression, dimension.name)
      .apply('MEASURE', measureExpression)
      .sort($('MEASURE'), SortAction.DESCENDING)
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
        (error) => {
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
    var { essence, dimension, searchText, filterMode } = this.props;
    if (searchText && filterMode === Filter.REGEX && !this.checkRegex(searchText)) return;
    this.fetchData(essence, dimension, searchText);
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps: PreviewStringFilterMenuProps) {
    var { searchText, filterMode } = this.props;
    var incomingSearchText = nextProps.searchText;
    const { fetchQueued, loading, dataset } = this.state;
    if (incomingSearchText && filterMode === Filter.REGEX) this.checkRegex(incomingSearchText);

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

  globalKeyDownListener(e: KeyboardEvent) {
    if (enterKey(e)) {
      this.onOkClick();
    }
  }

  constructFilter(): Filter {
    var { dimension, filterMode, onClauseChange, searchText } = this.props;
    var { expression } = dimension;

    var clause: FilterClause = null;
    if (searchText) {
      if (filterMode === Filter.REGEX) {
        clause = new FilterClause({
          expression,
          selection: searchText,
          action: 'match'
        });
      } else if (filterMode === Filter.CONTAINS) {
        clause = new FilterClause({
          expression,
          selection: r(searchText),
          action: 'contains'
        });
      }
    }

    return onClauseChange(clause);
  }

  onOkClick() {
    if (!this.actionEnabled()) return;
    var { clicker, onClose } = this.props;
    clicker.changeFilter(this.constructFilter());
    onClose();
  }

  onCancelClick() {
    var { onClose } = this.props;
    onClose();
  }

  actionEnabled() {
    const { regexErrorMessage } = this.state;
    var { essence } = this.props;
    if (regexErrorMessage) return false;
    return !essence.filter.equals(this.constructFilter());
  }

  renderRows() {
    var { loading, dataset, fetchQueued, regexErrorMessage  } = this.state;
    var { dimension, searchText, filterMode } = this.props;

    var rows: Array<JSX.Element> = [];
    var search: string | RegExp = null;

    if (dataset) {
      var rowStrings = dataset.data.slice(0, TOP_N).map((d) => d[dimension.name]);

      if (searchText) {
        rowStrings = rowStrings.filter((d) => {
          if (filterMode === Filter.REGEX) {
            try {
              var escaped = searchText.replace(/\\[^\\]]/g, '\\\\');
              search = new RegExp(escaped);
              return search.test(String(d));
            } catch (e) {
              return false;
            }
          } else if (filterMode === Filter.CONTAINS) {
            search = searchText;
            return String(d).toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
          }
          return false;
        });
      }

      rows = rowStrings.map((segmentValue) => {
        var segmentValueStr = String(segmentValue);
        return <div
          className="row no-select"
          key={segmentValueStr}
          title={segmentValueStr}
        >
          <div className="row-wrapper">
            <HighlightString className="label" text={segmentValueStr} highlight={search}/>
          </div>
        </div>;
      });
    }

    var grayMessage: JSX.Element = null;
    if (regexErrorMessage) {
      grayMessage = <div className="message">{regexErrorMessage}</div>;
    } else if (!loading && dataset && !fetchQueued && searchText && !rows.length) {
      grayMessage = <div className="message">{'No results for "' + searchText + '"'}</div>;
    }

    return <div className="rows">
        {(rows.length === 0 || !searchText) ? null : <div className="matching-values-message">Matching Values</div>}
        {rows}
        {grayMessage}
      </div>;
  }

  render() {
    const { filterMode } = this.props;
    const { dataset, loading, queryError } = this.state;

    var hasMore = dataset && dataset.data.length > TOP_N;
    return <div className={classNames("string-filter-menu", filterMode)}>
      <GlobalEventListener
        keyDown={this.globalKeyDownListener.bind(this)}
      />
      <div className={classNames('menu-table', hasMore ? 'has-more' : 'no-more')}>
        {this.renderRows()}
        {queryError ? <QueryError error={queryError}/> : null}
        {loading ? <Loader/> : null}
      </div>
      <div className="ok-cancel-bar">
        <Button type="primary" title={STRINGS.ok} onClick={this.onOkClick.bind(this)} disabled={!this.actionEnabled()} />
        <Button type="secondary" title={STRINGS.cancel} onClick={this.onCancelClick.bind(this)} />
      </div>
    </div>;
  }
}
