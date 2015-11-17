'use strict';
require('./bar-chart.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
// import { ... } from '../../config/constants';
import { Stage, Clicker, Essence, DataSource, Filter, Splits, Dimension, Measure, Colors, VisualizationProps, Resolve } from '../../../common/models/index';
// import { SomeComp } from '../some-comp/some-comp';

export interface BarChartState {
}

export class BarChart extends React.Component<VisualizationProps, BarChartState> {
  static id = 'bar-chart';
  static title = 'Bar Chart';

  static handleCircumstance(dataSource: DataSource, splits: Splits, colors: Colors, current: boolean): Resolve {
    return Resolve.manual(0, 'The Bar Chart visualization is not ready, please select another visualization.', []);
  }

  public mounted: boolean;

  constructor() {
    super();
    // this.state = {};

  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps: VisualizationProps) {

  }

  render() {
    return <div className="bar-chart"></div>;
  }
}
