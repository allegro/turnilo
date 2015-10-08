'use strict';
require('./menu-table.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset, SortAction } from 'plywood';
import { formatterFromData } from '../../../common/utils/formatter/formatter';
import { Essence, DataSource, Filter, Dimension, Measure, Clicker } from "../../../common/models/index";
import { Checkbox } from '../checkbox/checkbox';

const TOP_N = 100;

export interface MenuTableProps {
  essence: Essence;
  dimension: Dimension;
  showSearch: boolean;
  showCheckboxes: boolean;
  selectedValues: List<string>;
  onValueClick: Function;
}

export interface MenuTableState {
  dataset?: Dataset;
}

export class MenuTable extends React.Component<MenuTableProps, MenuTableState> {
  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      dataset: null
    };
  }

  fetchData(essence: Essence, dimension: Dimension): void {
    var { dataSource } = essence;
    var measure = essence.getPreviewSortMeasure();

    var query = $('main')
      .filter(essence.getEffectiveFilter(null, dimension).toExpression())
      .split(dimension.expression, dimension.name)
      .performAction(measure.toApplyAction())
      .sort($(measure.name), SortAction.DESCENDING)
      .limit(TOP_N + 1);

    dataSource.executor(query).then((dataset) => {
      if (!this.mounted) return;
      this.setState({ dataset });
    });
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

  render() {
    var { essence, dimension, showSearch, showCheckboxes, onValueClick, selectedValues } = this.props;
    var { dataset } = this.state;
    var measure = essence.getPreviewSortMeasure();

    var dimensionName = dimension.name;
    var measureName = measure.name;

    var rows: Array<React.DOMElement<any>> = [];
    var hasMore = false;
    if (dataset) {
      hasMore = dataset.data.length > TOP_N;
      var rowData = dataset.data.slice(0, TOP_N);
      var formatter = formatterFromData(rowData.map(d => d[measureName]), measure.format);
      rows = rowData.map((d) => {
        var segmentValue = d[dimensionName];
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
          <div className={'row' + (selected ? ' selected' : '')} key={segmentValueStr}>
            <div className="segment-value" onClick={onValueClick.bind(this, segmentValue)}>
              {checkbox}
              <div className="label">{segmentValueStr}</div>
            </div>
            <div className="measure-value">{measureValueStr}</div>
          </div>
        `);
      });
    }

    var className = [
      'menu-table',
      (hasMore ? 'has-more' : 'no-more'),
      (showSearch ? 'with-search' : 'no-search')
    ].join(' ');

    var searchBar: React.DOMElement<any> = null;
    if (showSearch) {
      searchBar = JSX(`<div className="search"><input type="text" placeholder="Search"/></div>`);
    }

    return JSX(`
      <div className={className}>
        {searchBar}
        <div className="rows">{rows}</div>
      </div>
    `);
  }
}
