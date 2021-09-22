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

import * as React from "react";
import { VisualizationProps } from "../../../common/models/visualization-props/visualization-props";
import { LINE_CHART_MANIFEST } from "../../../common/visualization-manifests/line-chart/line-chart";
import { MessageCard } from "../../components/message-card/message-card";
import { CenterPanel, CenterProps } from "../../views/cube-view/center-panel/center-panel";
import { Charts } from "./charts/charts";
import { InteractionController } from "./interactions/interaction-controller";
import "./line-chart.scss";
import pickXAxisTicks from "./utils/pick-x-axis-ticks";
import { calculateXRange, createContinuousScale } from "./utils/x-scale";
import { XAxis } from "./x-axis/x-axis";

const Y_AXIS_WIDTH = 60;
const X_AXIS_HEIGHT = 30;

export function LineChart(props: CenterProps) {
  return <CenterPanel {...props} visualizationComponent={LineChartComponent} />;
}

export class LineChartComponent extends React.Component<VisualizationProps> {
  protected className = LINE_CHART_MANIFEST.name;

  private chartsRef = React.createRef<HTMLDivElement>();

  render(): JSX.Element {
    const { essence, data, timekeeper, stage, highlight, dropHighlight, acceptHighlight, saveHighlight } = this.props;

    const range = calculateXRange(essence, timekeeper, data);
    if (!range) {
      return <MessageCard title="No data found. Try different filters."/>;
    }
    const scale = createContinuousScale(essence, range, stage.width - Y_AXIS_WIDTH);
    const ticks = pickXAxisTicks(scale.domain(), essence.timezone);

    const maxHeight = stage.height - X_AXIS_HEIGHT;

    return <InteractionController
      dataset={data}
      xScale={scale}
      chartsContainerRef={this.chartsRef}
      essence={essence}
      highlight={highlight}
      dropHighlight={dropHighlight}
      acceptHighlight={acceptHighlight}
      saveHighlight={saveHighlight}>
      {interactions => {
        return <div className="line-chart-container">
          <div className="line-charts" ref={this.chartsRef} style={{ maxHeight }}>
            <Charts
              interactions={interactions}
              stage={stage.changeHeight(maxHeight)}
              essence={essence}
              xScale={scale}
              xTicks={ticks}
              dataset={data} />
          </div>
          <XAxis
            width={stage.width}
            ticks={ticks}
            scale={scale}
            timezone={essence.timezone} />
        </div>;
      }}
    </InteractionController>;
  }
}
