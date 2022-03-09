/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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

import React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Essence, VisStrategy } from "../../../common/models/essence/essence";
import { Resolution } from "../../../common/models/visualization-manifest/visualization-manifest";
import { MessageCard } from "../message-card/message-card";
import "./manual-fallback.scss";

export interface ManualFallbackProps {
  clicker: Clicker;
  essence: Essence;
}

export class ManualFallback extends React.Component<ManualFallbackProps, {}> {

  onResolutionClick(resolution: Resolution): void {
    const { clicker } = this.props;
    const { adjustment: { splits, series } } = resolution;

    if (series != null) {
      clicker.changeSeriesList(series);
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
      return <li className="resolution-item" key={i} onClick={this.onResolutionClick.bind(this, resolution)}>{resolution.description}</li>;
    });

    return <MessageCard title={visResolve.message}>
      <ul className="manual-fallback">
        {resolutionItems}
      </ul>
    </MessageCard>;
  }
}
