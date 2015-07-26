'use strict';

import React = require('react/addons');
import { $, Expression, Dispatcher, NativeDataset, Datum } from 'plywood';
import { Filter, SplitCombine, Dimension, Measure, DataSource } from '../../models/index';
// import { SomeComp } from '../some-comp/some-comp';

interface NestedTableVisProps {
  dataSource: DataSource;
  filter: Filter;
  splits: SplitCombine[];
  measures: Measure[];
}

interface NestedTableVisState {
  dataset: NativeDataset;
}

export class NestedTableVis extends React.Component<NestedTableVisProps, NestedTableVisState> {

  constructor() {
    super();
    this.state = {
      dataset: null
    };
  }

  fetchData(filter: Filter, measures: Measure[], splits: SplitCombine[]) {
    var { dataSource } = this.props;

    var $main = $('main');
    var query: any = $()
      .apply('main', $main.filter(filter.toExpression()));

    for (let split of splits) {
      var subQuery = $main.split(split.splitOn, 'Split');

      for (let measure of measures) {
        subQuery = subQuery.apply(measure.name, measure.expression);
      }
      subQuery = subQuery.sort($(measures[0].name), 'descending').limit(100);

      query = query.apply('Split', subQuery);
    }

    dataSource.dispatcher(query).then((dataset) => {
      this.setState({ dataset });
    });
  }

  componentDidMount() {
    var props = this.props;
    this.fetchData(props.filter, props.measures, props.splits);
  }

  componentWillReceiveProps(nextProps: NestedTableVisProps) {
    var props = this.props;
    if (props.filter !== nextProps.filter || props.measures !== nextProps.measures || props.splits !== nextProps.splits) {
      this.fetchData(nextProps.filter, nextProps.measures, nextProps.splits);
    }
  }

  componentWillUnmount() {

  }

  render() {
    var { measures } = this.props;
    var { dataset } = this.state;

    var headerColumns = [
      JSX(`<div className="segment" key="_segment">Segment</div>`)
    ].concat(measures.map(measure => {
        return JSX(`<div className="measure" key={measure.name}>{measure.title}</div>`);
      }));

    var rows: React.DOMElement<any>[] = [];
    if (dataset) {
      rows = dataset.data[0]['Split'].data.map((d: Datum, i: number) => {
        var row = [
          JSX(`<div className="segment" key="_segment">{String(d['Split'])}</div>`)
        ].concat(measures.map(measure => {
            return JSX(`<div className="measure" key={measure.name}>{d[measure.name]}</div>`);
          }));

        return JSX(`<div className="row" key={'_' + i}>{row}</div>`);
      });
    }

    return JSX(`
      <div className="nested-table-vis">
        <div className="header">{headerColumns}</div>
        <div className="rows">{rows}</div>
      </div>
    `);
  }
}
