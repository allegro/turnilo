'use strict';

import React = require('react/addons');
import { $, Expression, Dispatcher, NativeDataset } from 'plywood';
import { DataSource, Filter, Dimension, Measure, Clicker } from "../../models/index";
// import { DateShow } from "../date-show/date-show";

var topN = 100;

interface MenuTableProps {
  dataSource: DataSource;
  filter: Filter;
  dimension: Dimension;
  showSearch: boolean;
  showCheckboxes: boolean;
  selectFilter: (newFilter: Filter, source: string) => void;
}

interface MenuTableState {
  dataset?: NativeDataset;
  selectedValues?: string[];
}

export class MenuTable extends React.Component<MenuTableProps, MenuTableState> {

  constructor() {
    super();
    this.state = {
      dataset: null,
      selectedValues: []
    };
  }

  fetchData(filter: Filter, dimension: Dimension) {
    var { dataSource } = this.props;

    var query: any = $('main')
      .filter(filter.toExpression())
      .split(dimension.expression, dimension.name)
      .apply('Measure', '$main.count()')
      .sort('$Measure', 'descending')
      .limit(topN + 1);

    dataSource.dispatcher(query).then((dataset) => {
      this.setState({ dataset });
    });
  }

  componentDidMount() {
    var props = this.props;
    this.fetchData(props.filter, props.dimension);
  }

  componentWillReceiveProps(nextProps: MenuTableProps) {
    var props = this.props;
    if (props.filter !== nextProps.filter || props.dimension !== nextProps.dimension) {
      this.fetchData(nextProps.filter, nextProps.dimension);
    }
  }

  componentWillUnmount() {

  }

  onBoxClick(value: any, e: MouseEvent) {
    e.stopPropagation();
    var { filter, dimension, selectFilter } = this.props;
    var { selectedValues } = this.state;
    if (selectedValues.indexOf(value) > -1) {
      selectedValues = selectedValues.filter(selectedValue => selectedValue !== value);
    } else {
      selectedValues = selectedValues.concat([value]);
    }
    this.setState({ selectedValues });
    if (selectFilter) {
      selectFilter(filter.setValues(dimension.expression, selectedValues), 'checkbox');
    }
  }

  onValueClick(value: any) {
    var { filter, dimension, selectFilter } = this.props;
    var { selectedValues } = this.state;
    this.setState({
      selectedValues: [value]
    });
    if (selectFilter) {
      selectFilter(filter.add(dimension.expression, value), 'value');
    }
  }

  render() {
    var { dimension, showSearch, showCheckboxes } = this.props;
    var { dataset, selectedValues } = this.state;

    var rows: Array<React.DOMElement<any>> = [];
    var hasMore = false;
    if (dataset) {
      hasMore = dataset.data.length > topN;
      rows = dataset.data.slice(0, topN).map((d) => {
        var segmentValue = String(d[dimension.name]);
        var measureValue = d['Measure'];
        var selected = selectedValues.indexOf(segmentValue) > -1;

        var checkbox: React.DOMElement<any> = null;
        if (showCheckboxes) {
          checkbox = JSX(`<div className="checkbox" onClick={this.onBoxClick.bind(this, segmentValue)}></div>`);
        }

        return JSX(`
          <div className={'row' + (selected ? ' selected' : '')} key={segmentValue}>
            <div className="segment-value" onClick={this.onValueClick.bind(this, segmentValue)}>
              {checkbox}
              <div className="label">{segmentValue}</div>
            </div>
            <div className="measure-value">{measureValue}</div>
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
