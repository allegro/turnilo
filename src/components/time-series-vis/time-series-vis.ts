'use strict';

import React = require("react");
import d3 = require('d3');
import { $, Dispatcher, Expression, NativeDataset, Datum } from 'plywood';

import { Filter, Dimension, Measure } from "../../models/index";

import { bindOne, bindMany } from "../../utils/render";

interface TimeSeriesVisProps {
  dispatcher: Dispatcher;
  filter: Filter;
  measures: Measure[];
}

interface TimeSeriesVisState {
  dataset: NativeDataset;
}

export class TimeSeriesVis extends React.Component<TimeSeriesVisProps, TimeSeriesVisState> {

  constructor() {
    super();
    this.state = {
      dataset: null
    };
  }

  fetchData(filter: Filter, measures: Measure[]) {
    var query: any = $('main')
      .filter(filter.toExpression())
      .split($('time').timeBucket('PT1H', 'Etc/UTC'), 'Time');

    for (let measure of measures) {
      query = query.apply(measure.name, measure.expression);
    }
    query = query.sort('$Time', 'ascending');

    this.props.dispatcher(query).then((dataset) => {
      this.setState({ dataset });
    });
  }

  componentDidMount() {
    var props = this.props;
    this.fetchData(props.filter, props.measures);
  }

  componentWillReceiveProps(nextProps: TimeSeriesVisProps) {
    var props = this.props;
    if (props.filter !== nextProps.filter || props.measures !== nextProps.measures) {
      this.fetchData(nextProps.filter, nextProps.measures);
    }
  }

  componentWillUnmount() {

  }

  render() {
    return JSX(`<div className="time-series-vis"></div>`);
  }
}
