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

import * as React from "react";
import { Stage } from "../../../../../common/models/stage/stage";
import { GridLines } from "../../../../components/grid-lines/grid-lines";
import { LinearScale } from "../../../../utils/scales/scales";
import { calculateTicks } from "../../../line-chart/base-chart/background/background";
import { BottomBorder } from "../../../line-chart/base-chart/background/bottom-border";

interface BackgroundProps {
  gridStage: Stage;
  yScale: LinearScale;
}

export const Background: React.SFC<BackgroundProps> = props => {
  const { gridStage, yScale } = props;
  // TODO: move outside line chart
  const ticks = calculateTicks(yScale, 5);
  return <React.Fragment>
    <GridLines
      orientation="horizontal"
      scale={yScale}
      ticks={ticks}
      stage={gridStage}
    />
    // TODO: move outside line chart
    <BottomBorder stage={gridStage} />
  </React.Fragment>;
};
