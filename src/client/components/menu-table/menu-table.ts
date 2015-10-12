'use strict';
require('./menu-table.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, r, Expression, Executor, Dataset, SortAction } from 'plywood';
import { SEGMENT } from '../../config/constants';
import { formatterFromData } from '../../../common/utils/formatter/formatter';
import { Essence, DataSource, Filter, Dimension, Measure, Clicker } from "../../../common/models/index";
import { ClearableInput } from '../clearable-input/clearable-input';
import { Checkbox } from '../checkbox/checkbox';
import { Loader } from '../loader/loader';

const TOP_N = 100;
const MAX_SEARCH_LENGTH = 300;
const SEARCH_WAIT = 900;

function focusOnInput(input: HTMLInputElement): void {
  if (!input) return;
  input.focus();
}

function collect(wait: number, func: Function): Function {
  var timeout: any;
  var later = function() {
    timeout = null;
    func();
  };
  return function() {
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }
  };
}

export interface MenuTableProps {
  essence: Essence;
  dimension: Dimension;
  showCheckboxes: boolean;
  selectedValues: List<string>;
  onValueClick: Function;
}

export interface MenuTableState {
  loading?: boolean;
  dataset?: Dataset;
  error?: any;
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
    var measure = essence.getPreviewSortMeasure();

    var filterExpression = essence.getEffectiveFilter(null, dimension).toExpression();

    if (searchText) {
      filterExpression = filterExpression.and(dimension.expression.contains(r(searchText)));
    }

    var query = $('main')
      .filter(filterExpression)
      .split(dimension.expression, SEGMENT)
      .performAction(measure.toApplyAction())
      .sort($(measure.name), SortAction.DESCENDING)
      .limit(TOP_N + 1);

    this.setState({ loading: true });
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
      essence.differentEffectiveFilter(nextEssence, null, nextDimension) ||
      !dimension.equals(nextDimension)
    ) {
      this.fetchData(nextEssence, nextDimension);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onSearchChange(text: string) {
    this.setState({
      searchText: text.substr(0, MAX_SEARCH_LENGTH)
    });
    this.collectTriggerSearch();
  }

  highlightInString(str: string, searchText: string): any {
    if (!searchText) return str;
    var strLower = str.toLowerCase();
    var startIndex = strLower.indexOf(searchText.toLowerCase());
    if (startIndex === -1) return str;
    var endIndex = startIndex + searchText.length;
    return [
      JSX(`<span className="pre"  key="pre" >{str.substring(0, startIndex)}</span>`),
      JSX(`<span className="bold" key="bold">{str.substring(startIndex, endIndex)}</span>`),
      JSX(`<span className="post" key="post">{str.substring(endIndex)}</span>`)
    ];
  }

  render() {
    var { essence, showCheckboxes, onValueClick, selectedValues } = this.props;
    var { loading, dataset, searchText } = this.state;
    var measure = essence.getPreviewSortMeasure();

    var measureName = measure.name;

    var rows: Array<React.DOMElement<any>> = [];
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

      var formatter = formatterFromData(rowData.map(d => d[measureName]), measure.format);
      rows = rowData.map((d) => {
        var segmentValue = d[SEGMENT];
        var segmentValueStr = String(segmentValue);
        var measureValue = d[measureName];
        var measureValueStr = formatter(measureValue);
        var selected = selectedValues && selectedValues.includes(segmentValue);

        var checkbox: React.ReactElement<any> = null;
        if (showCheckboxes) {
          checkbox = React.createElement(Checkbox, {
            checked: selected
          });
        }

        return JSX(`
          <div className={'row' + (selected ? ' selected' : '')} key={segmentValueStr} title={segmentValueStr}>
            <div className="segment-value" onClick={onValueClick.bind(this, segmentValue)}>
              {checkbox}
              <div className="label">{this.highlightInString(segmentValueStr, searchText)}</div>
            </div>
            <div className="measure-value">{measureValueStr}</div>
          </div>
        `);
      });
    }

    var loader: React.ReactElement<any> = null;
    var message: React.DOMElement<any> = null;
    if (loading) {
      loader = React.createElement(Loader, null);
    } else if (dataset && searchText && !rows.length) {
      message = JSX(`<div className="message">{'No results for "' + searchText + '"'}</div>`);
    }

    var className = [
      'menu-table',
      (hasMore ? 'has-more' : 'no-more')
    ].join(' ');

    return JSX(`
      <div className={className}>
        <div className="search">
          <ClearableInput
            placeholder="Search"
            focusOnMount={true}
            value={searchText}
            onChange={this.onSearchChange.bind(this)}
          />
        </div>
        <div className="rows">
          {rows}
          {loader}
          {message}
        </div>
      </div>
    `);
  }
}
