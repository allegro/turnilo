'use strict';

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
  selectFilter: (newFilter: Filter, source: string) => void;
}

interface MenuTableState {
  dataset?: Dataset;
  selectedValues?: string[];
}

export class MenuTable extends React.Component<MenuTableProps, MenuTableState> {
  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      dataset: null,
      selectedValues: []
    };
  }

  fetchData(filter: Filter, dimension: Dimension) {
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
    this.fetchData(essence.filter, dimension);
  }

  componentWillReceiveProps(nextProps: MenuTableProps) {
    var essence = this.props.essence;
    var nextEssence = nextProps.essence;
    if (
      essence.filter.equals(nextEssence.filter) &&
      this.props.dimension.equals(nextProps.dimension)
    ) return;
    this.fetchData(nextEssence.filter, nextProps.dimension);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onBoxClick(value: any, e: MouseEvent) {
    e.stopPropagation();
    var { essence, dimension, selectFilter } = this.props;
    var { selectedValues } = this.state;
    if (selectedValues.indexOf(value) > -1) {
      selectedValues = selectedValues.filter(selectedValue => selectedValue !== value);
    } else {
      selectedValues = selectedValues.concat([value]);
    }
    this.setState({ selectedValues });
    if (selectFilter) {
      selectFilter(essence.filter.setValues(dimension.expression, selectedValues), 'checkbox');
    }
  }

  render() {
    var { essence, dimension, showSearch, showCheckboxes } = this.props;
    var { dataset, selectedValues } = this.state;
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
        var selected = selectedValues.indexOf(segmentValue) > -1;

        var checkbox: React.ReactElement<any> = null;
        if (showCheckboxes) {
          checkbox = React.createElement(Checkbox, {
            checked: selected,
            onClick: <Function>this.onBoxClick.bind(this, segmentValue)
          });
        }

        return JSX(`
          <div className={'row' + (selected ? ' selected' : '')} key={segmentValue}>
            <div className="segment-value" onClick={this.onBoxClick.bind(this, segmentValue)}>
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
