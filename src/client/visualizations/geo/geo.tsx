/*
 * Copyright 2015-2016 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
