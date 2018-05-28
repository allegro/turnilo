/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2018 Allegro.pl
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

import * as React from "react";

import { Clicker, Essence, Resolution, VisStrategy } from "../../../common/models";
import "./manual-fallback.scss";

export interface ManualFallbackProps {
  clicker: Clicker;
  essence: Essence;
}

export class ManualFallback extends React.Component<ManualFallbackProps, {}> {

  onResolutionClick(resolution: Resolution): void {
    const { clicker } = this.props;
    const { adjustment: { splits, selectedMeasures } } = resolution;

    if (selectedMeasures != null && selectedMeasures.length > 0) {
      selectedMeasures.forEach(clicker.toggleEffectiveMeasure);
    }
    if (splits != null) {
      clicker.changeSplits(splits, VisStrategy.KeepAlways);
    }
  }

  render() {
    const { essence } = this.props;
    const { visResolve } = essence;

    if (!visResolve.isManual()) return null;

    const resolutionItems = visResolve.resolutions.map((resolution, i) => {
      return <li key={i} onClick={this.onResolutionClick.bind(this, resolution)}>{resolution.description}</li>;
    });

    return <div className="manual-fallback">
      <div className="message">{visResolve.message}</div>
      <ul>{resolutionItems}</ul>
    </div>;
  }
}
