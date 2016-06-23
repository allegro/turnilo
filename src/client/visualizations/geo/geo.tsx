require('./geo.css');

import * as React from 'react';
import { VisualizationProps } from '../../../common/models/index';
import { GEO_MANIFEST } from '../../../common/manifests/geo/geo';

import { BaseVisualization, BaseVisualizationState } from '../base-visualization/base-visualization';


export interface GeoState extends BaseVisualizationState {
}

export class Geo extends BaseVisualization<GeoState> {
  public static id = GEO_MANIFEST.name;

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
