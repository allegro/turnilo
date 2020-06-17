/*
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

import { Timezone } from "chronoshift";
import * as React from "react";
import { ReactNode } from "react";
import { Stage } from "../../../../common/models/stage/stage";
import { Unary } from "../../../../common/utils/functional/functional";
import getScale from "../../../utils/linear-scale/linear-scale";
import { mouseEventOffset } from "../../../utils/mouse-event-offset/mouse-event-offset";
import { Scale } from "../chart-line/chart-line";
import { isHover } from "../interactions/interaction";
import { InteractionsProps } from "../interactions/interaction-controller";
import { ContinuousScale } from "../utils/continuous-types";
import { ContinuousTicks } from "../utils/pick-x-axis-ticks";
import { Background } from "./background/background";
import "./base-chart.scss";
import { Foreground } from "./foreground/foreground";
import { HoverGuide } from "./foreground/hover-guide";

interface ChartLinesProps {
  yScale: Scale;
  lineStage: Stage;
}

class BaseChartProps {
  chartId: string;
  children: Unary<ChartLinesProps, ReactNode>;
  label: ReactNode;
  hoverContent?: ReactNode;
  xScale: ContinuousScale;
  timezone: Timezone;
  xTicks: ContinuousTicks;
  chartStage: Stage;
  visualisationStage: Stage;
  formatter: Unary<number, string>;
  yDomain: [number, number];
  interactions: InteractionsProps;
}

const TEXT_SPACER = 36;

const offsetX = (e: React.MouseEvent<HTMLElement> | MouseEvent) => mouseEventOffset(e)[0];

export class BaseChart extends React.Component<BaseChartProps> {

  private container = React.createRef<HTMLDivElement>();

  render() {
    const { hoverContent, interactions, timezone, yDomain, visualisationStage, chartStage, chartId, children, label, formatter, xScale, xTicks } = this.props;
    const { interaction, dropHighlight, acceptHighlight, mouseLeave, dragStart, handleHover } = interactions;

    const [, xRange] = xScale.range();
    const lineStage = chartStage.within({ top: TEXT_SPACER, right: chartStage.width - xRange });
    const axisStage = chartStage.within({ top: TEXT_SPACER, left: xRange });

    const yScale = getScale(yDomain, lineStage.height);
    const hasInteraction = interaction && interaction.key === chartId;

    return <React.Fragment>
      <div className="line-base-chart" ref={this.container} style={chartStage.getWidthHeight()}>
        <svg className="chart-stage" viewBox={chartStage.getViewBox()}>
          <Background
            axisStage={axisStage}
            formatter={formatter}
            gridStage={lineStage}
            xScale={xScale}
            xTicks={xTicks}
            yScale={yScale} />
          {children({ yScale, lineStage })}
          {hasInteraction && isHover(interaction) && <HoverGuide
            hover={interaction}
            stage={lineStage}
            yScale={yScale}
            xScale={xScale} />}
        </svg>
        <div style={lineStage.getWidthHeight()}
             className="event-region"
             onMouseDown={e => dragStart(chartId, offsetX(e))}
             onMouseMove={e => handleHover(chartId, offsetX(e))}
             onMouseLeave={mouseLeave}
        />
        {label}
        {hasInteraction && <Foreground
          container={this.container}
          stage={lineStage}
          visualisationStage={visualisationStage}
          interaction={interaction}
          hoverContent={hoverContent}
          dropHighlight={dropHighlight}
          acceptHighlight={acceptHighlight}
          xScale={xScale}
          timezone={timezone} />}
      </div>
    </React.Fragment>;
  }
}
