require('./geo.css');

import { BaseVisualization, BaseVisualizationState } from '../base-visualization/base-visualization';

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Essence, DataSource, Filter, Splits, Dimension, Measure, Colors, VisualizationProps, Resolve } from '../../../common/models/index';

export interface GeoState extends BaseVisualizationState {
}

export class Geo extends BaseVisualization<GeoState> {
  public static id = 'geo';
  public static title = 'Geo';

  public static handleCircumstance(dataSource: DataSource, splits: Splits, colors: Colors, current: boolean): Resolve {
    return Resolve.manual(0, 'The Geo visualization is not ready, please select another visualization.', []);
  }

  constructor() {
    super();
  }

  getDefaultState(): GeoState {
    return super.getDefaultState() as GeoState;
  }

  componentWillMount() {}

  componentDidMount() {}

  componentWillReceiveProps(nextProps: VisualizationProps) {}

  renderInternals() {
    return <div className="internals"></div>;
  }
}
