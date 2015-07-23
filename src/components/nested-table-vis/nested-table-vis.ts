'use strict';

import React = require('react');
import { $, Expression, Dispatcher, NativeDataset, Datum } from 'plywood';
import { Filter, Dimension, Measure } from '../../models/index';
// import { SomeComp } from '../some-comp/some-comp';

interface NestedTableVisProps {
  dispatcher: Dispatcher;
  filter: Filter;
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

  fetchData(filter: Filter, measures: Measure[]) {
    var { dispatcher } = this.props;

    var query: any = $('main')
      .filter(filter.toExpression())
      .split($('page'), 'Page');

    for (let measure of measures) {
      query = query.apply(measure.name, measure.expression);
    }
    query = query.sort($(measures[0].name), 'descending').limit(100);

    dispatcher(query).then((dataset) => {
      this.setState({ dataset });
    });
  }

  componentDidMount() {
    var props = this.props;
    this.fetchData(props.filter, props.measures);
  }

  componentWillReceiveProps(nextProps: NestedTableVisProps) {
    var props = this.props;
    if (props.filter !== nextProps.filter || props.measures !== nextProps.measures) {
      this.fetchData(nextProps.filter, nextProps.measures);
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
      rows = dataset.data.map((d: Datum, i: number) => {
        var row = [
          JSX(`<div className="segment" key="_segment">{d['Page']}</div>`)
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
