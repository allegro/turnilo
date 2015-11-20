'use strict';
require('./menu-table.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, r, Expression, Executor, Dataset, SortAction, Set } from 'plywood';
import { SEGMENT, MAX_SEARCH_LENGTH, SEARCH_WAIT } from '../../config/constants';
import { Essence, DataSource, Filter, Dimension, Measure, Clicker, Colors } from "../../../common/models/index";
import { collect } from '../../../common/utils/general/general';
import { ClearableInput } from '../clearable-input/clearable-input';
import { Checkbox } from '../checkbox/checkbox';
import { Loader } from '../loader/loader';
import { HighlightString } from '../highlight-string/highlight-string';

const TOP_N = 100;

export interface MenuTableProps extends React.Props<any> {
  essence: Essence;
  dimension: Dimension;
  selectedValues: Set;
  colors?: Colors;
  onValueClick: Function;
}

export interface MenuTableState {
  loading?: boolean;
  dataset?: Dataset;
  error?: any;
  fetchQueued?: boolean;
  searchText?: string;
}

export class MenuTable extends React.Component<MenuTableProps, MenuTableState> {
  public mounted: boolean;
  public collectTriggerSearch: Function;

  constructor() {
    super();
    this.state = {
      loading: false,
      dataset: null,
      error: null,
      fetchQueued: false,
      searchText: ''
    };

    this.collectTriggerSearch = collect(SEARCH_WAIT, () => {
      if (!this.mounted) return;
      var { essence, dimension } = this.props;
      this.fetchData(essence, dimension);
    });
  }

  fetchData(essence: Essence, dimension: Dimension): void {
    var { searchText } = this.state;
    var { dataSource } = essence;
    var nativeCount = dataSource.getMeasure('count');
    var measureExpression = nativeCount ? nativeCount.expression : $('main').count();

    var filterExpression = essence.getEffectiveFilter(null, dimension).toExpression();

    if (searchText) {
      filterExpression = filterExpression.and(dimension.expression.contains(r(searchText), 'ignoreCase'));
    }

    var query = $('main')
      .filter(filterExpression)
      .split(dimension.expression, SEGMENT)
      .apply('MEASURE', measureExpression)
      .sort($('MEASURE'), SortAction.DESCENDING)
      .limit(TOP_N + 1);

    this.setState({
      loading: true,
      fetchQueued: false
    });
    dataSource.executor(query)
      .then(
        (dataset) => {
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

  componentDidMount() {
    this.mounted = true;
    var { essence, dimension } = this.props;
    this.fetchData(essence, dimension);
  }

  componentWillReceiveProps(nextProps: MenuTableProps) {
    var { essence, dimension } = this.props;
    var nextEssence = nextProps.essence;
    var nextDimension = nextProps.dimension;

    if (
      essence.differentDataSource(nextEssence) ||
      essence.differentEffectiveFilter(nextEssence, null, nextDimension) || !dimension.equals(nextDimension)
    ) {
      this.fetchData(nextEssence, nextDimension);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onSearchChange(text: string) {
    var { searchText, dataset, fetchQueued, loading } = this.state;
    var newSearchText = text.substr(0, MAX_SEARCH_LENGTH);

    // If the user is just typing in more and there are already < TOP_N results then there is nothing to do
    if (newSearchText.indexOf(searchText) !== -1 && !fetchQueued && !loading && dataset && dataset.data.length < TOP_N) {
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

  render() {
    var { essence, onValueClick, selectedValues } = this.props;
    var { loading, dataset, fetchQueued, searchText } = this.state;

    var rows: Array<JSX.Element> = [];
    var hasMore = false;
    if (dataset) {
      hasMore = dataset.data.length > TOP_N;
      var rowData = dataset.data.slice(0, TOP_N);

      if (searchText) {
        var searchTextLower = searchText.toLowerCase();
        rowData = rowData.filter((d) => {
          return String(d[SEGMENT]).toLowerCase().indexOf(searchTextLower) !== -1;
        });
      }

      rows = rowData.map((d) => {
        var segmentValue = d[SEGMENT];
        var segmentValueStr = String(segmentValue);
        var selected = selectedValues && selectedValues.contains(segmentValue);

        return <div
          className={'row' + (selected ? ' selected' : '')}
          key={segmentValueStr}
          title={segmentValueStr}
          onClick={onValueClick.bind(this, segmentValue)}
        >
          <Checkbox selected={selected}/>
          <HighlightString className="label" text={segmentValueStr} highlightText={searchText}/>
        </div>;
      });
    }

    var loader: JSX.Element = null;
    var message: JSX.Element = null;
    if (loading) {
      loader = <Loader/>;
    } else if (dataset && !fetchQueued && searchText && !rows.length) {
      message = <div className="message">{'No results for "' + searchText + '"'}</div>;
    }

    var className = [
      'menu-table',
      (hasMore ? 'has-more' : 'no-more')
    ].join(' ');

    return <div className={className}>
      <div className="search-box">
        <ClearableInput
          placeholder="Search"
          focusOnMount={true}
          value={searchText}
          onChange={this.onSearchChange.bind(this)}
        />
      </div>
      <div className="rows">
        {rows}
        {message}
      </div>
      {loader}
    </div>;
  }
}
