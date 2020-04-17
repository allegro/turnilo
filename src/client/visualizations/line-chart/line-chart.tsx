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

import { Dataset } from "plywood";
import * as React from "react";
import { LINE_CHART_MANIFEST } from "../../../common/visualization-manifests/line-chart/line-chart";
import { BaseVisualization, BaseVisualizationState } from "../base-visualization/base-visualization";
import { Charts } from "./charts/charts";
import { Interactions } from "./interactions/interactions";
import "./line-chart.scss";
import calculateXScale from "./utils/calculate-x-scale";
import pickXAxisTicks from "./utils/pick-x-axis-ticks";
import { XAxis } from "./x-axis/x-axis";

const Y_AXIS_WIDTH = 60;

export class LineChart extends BaseVisualization<BaseVisualizationState> {
  protected className = LINE_CHART_MANIFEST.name;

  protected renderInternals(dataset: Dataset): JSX.Element {
    const { essence, timekeeper, stage } = this.props;

    const scale = calculateXScale(essence, timekeeper, dataset, stage.width - Y_AXIS_WIDTH);
    const ticks = pickXAxisTicks(scale, essence.timezone);

    return <Interactions
      highlight={this.getHighlight()}
      saveHighlight={this.highlight}>
      {({ interaction }) => {
        return <div className="line-chart-container">
          <Charts
            stage={stage}
            essence={essence}
            scale={scale}
            ticks={ticks}
            dataset={dataset} />
          <XAxis
            width={stage.width}
            ticks={ticks}
            scale={scale}
            timezone={essence.timezone} />
        </div>;
      }}
    </Interactions>;
  }
}
