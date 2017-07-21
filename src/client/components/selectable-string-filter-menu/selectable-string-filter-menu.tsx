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

require('./selectable-string-filter-menu.css');

import * as React from "react";
import { $, r, Dataset, SortAction, Set } from "swiv-plywood";
import { Fn, collect } from "../../../common/utils/general/general";
import { STRINGS, SEARCH_WAIT } from "../../config/constants";
import { Clicker, Essence, Timekeeper, Filter, FilterClause, FilterMode, Dimension, Colors } from "../../../common/models/index";
import { enterKey, classNames } from "../../utils/dom/dom";
import { Checkbox, CheckboxType } from "../checkbox/checkbox";
import { Loader } from "../loader/loader";
import { QueryError } from "../query-error/query-error";
import { HighlightString } from "../highlight-string/highlight-string";
import { Button } from "../button/button";
import { GlobalEventListener } from "../global-event-listener/global-event-listener";

const TOP_N = 100;

export interface SelectableStringFilterMenuProps extends React.Props<any> {
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
  selectedValues?: Set;
  promotedValues?: Set; // initial selected values
  colors?: Colors;
}

export class SelectableStringFilterMenu extends React.Component<SelectableStringFilterMenuProps, SelectableStringFilterMenuState> {
  public mounted: boolean;
  public collectTriggerSearch: Fn;

  constructor() {
    super();
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
      var { essence, timekeeper, dimension, searchText } = this.props;
      this.fetchData(essence, timekeeper, dimension, searchText);
    });
  }

  fetchData(essence: Essence, timekeeper: Timekeeper, dimension: Dimension, searchText: string): void {
    var { dataCube } = essence;
    var nativeCount = dataCube.getMeasure('count');
    var measureExpression = nativeCount ? nativeCount.expression : $('main').count();

    var filterExpression = essence.getEffectiveFilter(timekeeper, null, dimension).toExpression();

    if (searchText) {
      filterExpression = filterExpression.and(dimension.expression.contains(r(searchText), 'ignoreCase'));
    }

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
            error: null
          });
        },
        (error) => {
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
    var { essence, timekeeper, dimension, searchText } = this.props;
    var { filter, colors } = essence;

    var myColors = (colors && colors.dimension === dimension.name ? colors : null);

    var existingMode = filter.getModeForDimension(dimension);

    var valueSet = filter.getLiteralSet(dimension.expression);
    var selectedValues = (existingMode !== 'regex' && valueSet) || (myColors ? myColors.toSet() : null) || Set.EMPTY; // don't want regex to show up as a promoted value
    this.setState({
      selectedValues: selectedValues,
      promotedValues: selectedValues,
      colors: myColors
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
    var { searchText } = this.props;
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

  globalKeyDownListener(e: KeyboardEvent) {
    if (enterKey(e)) {
      this.onOkClick();
    }
  }

  constructFilter(): Filter {
    var { dimension, filterMode, onClauseChange } = this.props;
    var { selectedValues } = this.state;
    var { expression } = dimension;

    var clause: FilterClause = null;
    if (selectedValues.size()) {
      clause = new FilterClause({
        expression,
        selection: r(selectedValues),
        exclude: filterMode === Filter.EXCLUDED
      });
    }
    return onClauseChange(clause);
  }

  onValueClick(value: any, e: MouseEvent) {
    var { selectedValues, colors } = this.state;
    if (colors) {
      colors = colors.toggle(value);
      selectedValues = selectedValues.toggle(value);
    } else {
      if (e.altKey || e.ctrlKey || e.metaKey) {
        if (selectedValues.contains(value) && selectedValues.size() === 1) {
          selectedValues = Set.EMPTY;
        } else {
          selectedValues = Set.EMPTY.add(value);
        }
      } else {
        selectedValues = selectedValues.toggle(value);
      }
    }

    this.setState({
      selectedValues,
      colors
    });
  }

  onOkClick() {
    if (!this.actionEnabled()) return;
    var { clicker, onClose } = this.props;
    var { colors } = this.state;
    clicker.changeFilter(this.constructFilter(), colors);
    onClose();
  }

  onCancelClick() {
    var { onClose } = this.props;
    onClose();
  }

  actionEnabled() {
    var { essence } = this.props;
    return !essence.filter.equals(this.constructFilter());
  }

  renderRows() {
    var { loading, dataset, fetchQueued, selectedValues, promotedValues } = this.state;
    var { dimension, filterMode, searchText } = this.props;

    var rows: Array<JSX.Element> = [];
    if (dataset) {
      var promotedElements = promotedValues ? promotedValues.elements : [];
      var rowData = dataset.data.slice(0, TOP_N).filter((d) => {
        return promotedElements.indexOf(d[dimension.name]) === -1;
      });
      var rowStrings = promotedElements.concat(rowData.map((d) => d[dimension.name]));

      if (searchText) {
        var searchTextLower = searchText.toLowerCase();
        rowStrings = rowStrings.filter((d) => {
          return String(d).toLowerCase().indexOf(searchTextLower) !== -1;
        });
      }

      var checkboxType = filterMode === Filter.EXCLUDED ? 'cross' : 'check';
      rows = rowStrings.map((segmentValue) => {
          var segmentValueStr = String(segmentValue);
          var selected = selectedValues && selectedValues.contains(segmentValue);

          return <div
            className={classNames('row', { 'selected': selected })}
            key={segmentValueStr}
            title={segmentValueStr}
            onClick={this.onValueClick.bind(this, segmentValue)}
          >
            <div className="row-wrapper">
              <Checkbox type={checkboxType as CheckboxType} selected={selected}/>
              <HighlightString className="label" text={segmentValueStr} highlight={searchText}/>
            </div>
          </div>;
      });
    }

    var message: JSX.Element = null;
    if (!loading && dataset && !fetchQueued && searchText && !rows.length) {
      message = <div className="message">{'No results for "' + searchText + '"'}</div>;
    }

    return <div className="rows">
        {rows}
        {message}
      </div>;
  }

  render() {
    const { filterMode } = this.props;
    const { dataset, loading, error } = this.state;

    var hasMore = dataset && dataset.data.length > TOP_N;
    return <div className={classNames("string-filter-menu", filterMode)}>
      <GlobalEventListener
        keyDown={this.globalKeyDownListener.bind(this)}
      />
      <div className={classNames('menu-table', hasMore ? 'has-more' : 'no-more')}>
        {this.renderRows()}
        {error ? <QueryError error={error}/> : null}
        {loading ? <Loader/> : null}
      </div>
      <div className="ok-cancel-bar">
        <Button type="primary" title={STRINGS.ok} onClick={this.onOkClick.bind(this)} disabled={!this.actionEnabled()} />
        <Button type="secondary" title={STRINGS.cancel} onClick={this.onCancelClick.bind(this)} />
      </div>
    </div>;
  }
}
