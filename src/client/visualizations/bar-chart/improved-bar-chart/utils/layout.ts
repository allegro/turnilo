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

import { Stage } from "../../../../../common/models/stage/stage";
import { ScrollerLayout } from "../../../../components/scroller/scroller";
import { calculateSegmentStage } from "./calculate-segment-stage";

const Y_AXIS_WIDTH = 60;
const X_AXIS_HEIGHT = 40;
const LEFT_PADDING = 5;
const MARGINS: Margins = {
  left: LEFT_PADDING,
  right: Y_AXIS_WIDTH,
  bottom: X_AXIS_HEIGHT
};

interface Margins {
  left: number;
  right: number;
  bottom: number;
}

export interface BarChartLayout {
  scroller: ScrollerLayout;
  segment: Stage;
}

export function calculateLayout(visualisationStage: Stage, domainLength: number, seriesCount: number): BarChartLayout {
  const bodyStage = visualisationStage.within(MARGINS);
  const segmentStage = calculateSegmentStage(bodyStage, domainLength, seriesCount);
  const innerBodyHeight = segmentStage.height * seriesCount;
  return {
    scroller: {
      bodyHeight: innerBodyHeight,
      bodyWidth: segmentStage.width,
      top: 0,
      left: MARGINS.left,
      right: MARGINS.right,
      bottom: MARGINS.bottom
    },
    segment: segmentStage
  };
}

const TOP_MARGIN = 30;
const BOTTOM_MARGIN = 0;

export function calculateChartStage(segmentStage: Stage): Stage {
  return segmentStage.within({ top: TOP_MARGIN, bottom: BOTTOM_MARGIN });
}

export function calculateYAxisStage(segmentStage: Stage): Stage {
  return Stage.fromJS({
    x: 0,
    y: TOP_MARGIN,
    width: Y_AXIS_WIDTH,
    height: segmentStage.height - TOP_MARGIN - BOTTOM_MARGIN
  });
}
