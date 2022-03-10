/*
 * Copyright 2017-2022 Allegro.pl
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

import { Datum } from "plywood";
import { ConcreteSeries } from "../../../common/models/series/concrete-series";
import "./scatterplot.scss";

import { Timezone } from "chronoshift";
import { Split } from "../../../common/models/split/split";
import { Stage } from "../../../common/models/stage/stage";
import { isTruthy } from "../../../common/utils/general/general";
import { SegmentBubbleContent } from "../../components/segment-bubble/segment-bubble";
import { SeriesBubbleContent } from "../../components/series-bubble-content/series-bubble-content";
import { TooltipWithinStage } from "../../components/tooltip-within-stage/tooltip-within-stage";
import { LinearScale } from "../../utils/linear-scale/linear-scale";

interface TooltipProps {
  split: Split;
  datum: Datum;
  stage: Stage;
  xSeries: ConcreteSeries;
  ySeries: ConcreteSeries;
  xScale: LinearScale;
  yScale: LinearScale;
  timezone: Timezone;
  showPrevious: boolean;
}

const TOOLTIP_OFFSET_Y = 50;
const TOOLTIP_OFFSET_X = 100;

export const Tooltip: React.FunctionComponent<TooltipProps> = ({
  datum,
  stage,
  xSeries,
  ySeries,
  xScale,
  yScale,
  split,
  timezone,
  showPrevious
}) => {
  if (!isTruthy(datum)) return null;

  const xPosition = xScale(xSeries.selectValue(datum)) + TOOLTIP_OFFSET_X;
  const yPosition = yScale(ySeries.selectValue(datum)) + TOOLTIP_OFFSET_Y;

  return <TooltipWithinStage top={yPosition} left={xPosition} stage={stage}>
    <SegmentBubbleContent
      title={split.formatValue(datum, timezone)}
      content={<>
        <strong className="series-title">{xSeries.title()}</strong>
        <br/>
        <SeriesBubbleContent
          datum={datum}
          showPrevious={showPrevious}
          series={xSeries} />
        <br/>
        <br/>
        <strong className="series-title">{ySeries.title()}</strong><br/>
        <SeriesBubbleContent
          datum={datum}
          showPrevious={showPrevious}
          series={ySeries} />
      </>} />
  </TooltipWithinStage>;
};
