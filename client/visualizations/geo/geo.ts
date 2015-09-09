'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
// import * as Icon from 'react-svg-icons';
import { $, Expression, Executor, Dataset } from 'plywood';
// import { ... } from '../../config/constants';
import { Stage, Clicker, Essence, DataSource, Filter, Splits, Dimension, Measure, VisualizationProps, Resolve } from '../../models/index';
// import { SomeComp } from '../some-comp/some-comp';

interface GeoState {
}

export class Geo extends React.Component<VisualizationProps, GeoState> {
  static id = 'geo';
  static title = 'Geo';
  static handleCircumstance(dataSource: DataSource, splits: Splits): Resolve {
    return Resolve.manual('The Geo visualization is not ready, please select another visualization.', []);
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
      <div className="geo"></div>
    `);
  }
}
