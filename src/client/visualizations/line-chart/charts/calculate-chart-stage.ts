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

import { Stage } from "../../../../common/models/stage/stage";
import { VIS_H_PADDING } from "../../../config/constants";

const X_AXIS_HEIGHT = 30;
const MIN_CHART_HEIGHT = 200;
const MAX_ASPECT_RATIO = 1; // width / height

export function calculateChartStage(stage: Stage, chartsCount: number): Stage {
  const width = stage.width - VIS_H_PADDING * 2;
  const maxHeightFromRatio = width / MAX_ASPECT_RATIO;
  const heightFromStageDivision = (stage.height - X_AXIS_HEIGHT) / chartsCount;
  const boundedChartHeight = Math.floor(Math.min(
    maxHeightFromRatio,
    heightFromStageDivision
  ));
  const height = Math.max(MIN_CHART_HEIGHT, boundedChartHeight);

  return new Stage({
    x: VIS_H_PADDING,
    y: 0,
    width,
    height
  });
}
