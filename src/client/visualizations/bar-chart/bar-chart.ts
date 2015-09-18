'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
// import * as Icon from 'react-svg-icons';
import { $, Expression, Executor, Dataset } from 'plywood';
// import { ... } from '../../config/constants';
import { Stage, Clicker, Essence, DataSource, Filter, Splits, Dimension, Measure, VisualizationProps, Resolve } from '../../../common/models/index';
// import { SomeComp } from '../some-comp/some-comp';

interface BarChartState {
}

export class BarChart extends React.Component<VisualizationProps, BarChartState> {
  static id = 'bar-chart';
  static title = 'Bar Chart';
  static handleCircumstance(dataSource: DataSource, splits: Splits): Resolve {
    return Resolve.manual('The Bar Chart visualization is not ready, please select another visualization.', []);
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
    return JSX(`
      <div className="bar-chart"></div>
    `);
  }
}
