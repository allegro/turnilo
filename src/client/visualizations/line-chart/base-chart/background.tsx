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

import { scale } from "d3";
import * as React from "react";
import { Stage } from "../../../../common/models/stage/stage";
import { Unary } from "../../../../common/utils/functional/functional";
import { GridLines } from "../../../components/grid-lines/grid-lines";
import { VerticalAxis } from "../../../components/vertical-axis/vertical-axis";
import { ContinuousTicks } from "../utils/pick-x-axis-ticks";
import { ContinuousScale } from "../utils/scale";
import "./background.scss";

interface BackgroundProps {
  gridStage: Stage;
  axisStage: Stage;
  xScale: ContinuousScale;
  xTicks: ContinuousTicks;
  yScale: Linear;
  formatter: Unary<number, string>;
}

type Linear = scale.Linear<number, number>;

function calculateTicks(scale: Linear) {
  return scale.ticks(5).filter((n: number) => n !== 0);
}

const TICK_WIDTH = 5;

export const Background: React.SFC<BackgroundProps> = props => {
  const { formatter, gridStage, axisStage, xScale, yScale, xTicks } = props;

  return <React.Fragment>
    <GridLines
      orientation="horizontal"
      scale={yScale}
      ticks={calculateTicks(yScale)}
      stage={gridStage}
    />;
    <GridLines
      orientation="vertical"
      scale={xScale}
      ticks={xTicks}
      stage={gridStage}
    />
    <VerticalAxis
      tickSize={TICK_WIDTH}
      stage={axisStage}
      formatter={formatter}
      ticks={calculateTicks(yScale)}
      scale={yScale}
    />;
    <line
      className="vis-bottom"
      transform={gridStage.getTransform()}
      x1="0"
      x2={gridStage.width + TICK_WIDTH}
      y1={gridStage.height - 0.5}
      y2={gridStage.height - 0.5}
    />
  </React.Fragment>;
};
