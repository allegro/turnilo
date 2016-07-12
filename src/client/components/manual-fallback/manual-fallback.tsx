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

require('./manual-fallback.css');

import * as React from 'react';
import { Clicker, Essence, VisStrategy, Resolution } from '../../../common/models/index';


export interface ManualFallbackProps extends React.Props<any> {
  clicker: Clicker;
  essence: Essence;
}

export interface ManualFallbackState {
}

export class ManualFallback extends React.Component<ManualFallbackProps, ManualFallbackState> {

  constructor() {
    super();

  }

  onResolutionClick(resolution: Resolution): void {
    var { clicker } = this.props;
    clicker.changeSplits(resolution.adjustment.splits, VisStrategy.KeepAlways);
  }

  render() {
    var { essence } = this.props;
    var { visResolve } = essence;

    if (!visResolve.isManual()) return null;

    var resolutionItems = visResolve.resolutions.map((resolution, i) => {
      return <li key={i} onClick={this.onResolutionClick.bind(this, resolution)}>{resolution.description}</li>;
    });

    return <div className="manual-fallback">
      <div className="message">{visResolve.message}</div>
      <ul>{resolutionItems}</ul>
    </div>;
  }
}
