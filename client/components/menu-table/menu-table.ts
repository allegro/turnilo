'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import { $, Expression, Executor, Dataset } from 'plywood';
import { formatterFromData } from '../../utils/formatter';
import { Essence, DataSource, Filter, Dimension, Measure, Clicker } from "../../models/index";
import { Checkbox } from '../checkbox/checkbox';

const TOP_N = 100;

interface MenuTableProps {
  essence: Essence;
  dimension: Dimension;
  showSearch: boolean;
  showCheckboxes: boolean;
  selectedValues: List<string>;
  onValueClick: Function;
}

interface MenuTableState {
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

  fetchData(filter: Filter, dimension: Dimension): void {
    var { essence } = this.props;
    var { dataSource } = essence;
    var measure = dataSource.getSortMeasure(dimension);

    var query: any = $('main')
      .filter(filter.toExpression())
      .split(dimension.expression, dimension.name)
      .apply(measure.name, measure.expression)
      .sort($(measure.name), 'descending')
      .limit(TOP_N + 1);

    dataSource.executor(query).then((dataset) => {
      if (!this.mounted) return;
      this.setState({ dataset });
    });
  }

  componentDidMount() {
    this.mounted = true;
    var { essence, dimension } = this.props;
    this.fetchData(essence.filter.remove(dimension.expression), dimension);
  }

  componentWillReceiveProps(nextProps: MenuTableProps) {
    var dimension = this.props.dimension;
    var nextDimension = nextProps.dimension;
    var essence = this.props.essence;
    var nextEssence = nextProps.essence;
    var filter = essence.filter.remove(dimension.expression);
    var nextFilter = nextEssence.filter.remove(nextDimension.expression);
    if (
      filter.equals(nextFilter) &&
      dimension.equals(nextDimension)
    ) return;
    this.fetchData(nextFilter, nextDimension);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    var { essence, dimension, showSearch, showCheckboxes, onValueClick, selectedValues } = this.props;
    var { dataset } = this.state;
    var measure = essence.dataSource.getSortMeasure(dimension);

    var dimensionName = dimension.name;
    var measureName = measure.name;

    var rows: Array<React.DOMElement<any>> = [];
    var hasMore = false;
    if (dataset) {
      hasMore = dataset.data.length > TOP_N;
      var rowData = dataset.data.slice(0, TOP_N);
      var formatter = formatterFromData(rowData.map(d => d[measureName]), measure.format);
      rows = rowData.map((d) => {
        var segmentValue = String(d[dimensionName]);
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
          <div className={'row' + (selected ? ' selected' : '')} key={segmentValue}>
            <div className="segment-value" onClick={onValueClick.bind(this, segmentValue)}>
              {checkbox}
              <div className="label">{segmentValue}</div>
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
