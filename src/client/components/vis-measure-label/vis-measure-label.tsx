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

require('./vis-measure-label.css');

import * as React from 'react';
import { Datum } from 'plywood';
import { Measure } from '../../../common/models/index';

export interface VisMeasureLabelProps extends React.Props<any> {
  measure: Measure;
  datum: Datum;
}

export interface VisMeasureLabelState {
}

export class VisMeasureLabel extends React.Component<VisMeasureLabelProps, VisMeasureLabelState> {
  constructor() {
    super();

  }

  render() {
    const { measure, datum } = this.props;

    return <div className="vis-measure-label">
      <span className="measure-title">{measure.title}</span>
      <span className="colon">: </span>
      <span className="measure-value">{measure.formatFn(datum[measure.name] as number)}</span>
    </div>;
  }
}
