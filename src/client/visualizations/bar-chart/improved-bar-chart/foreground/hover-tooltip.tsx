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
import { Datum } from "plywood";
import * as React from "react";
import { Stage } from "../../../../../common/models/stage/stage";
import { formatValue } from "../../../../../common/utils/formatter/formatter";
import { Unary } from "../../../../../common/utils/functional/functional";
import { SegmentBubbleContent } from "../../../../components/segment-bubble/segment-bubble";
import { TooltipWithinStage } from "../../../../components/tooltip-within-stage/tooltip-within-stage";
import { LinearScale } from "../../../heat-map/utils/scales";
import { Hover } from "../interactions/interaction";
import { DomainValue } from "../utils/x-domain";
import { XScale } from "../utils/x-scale";

interface HoverTooltipProps {
  stage: Stage;
  interaction: Hover;
  xScale: XScale;
  yScale: LinearScale;
  getY: Unary<Datum, number>;
  getX: Unary<Datum, DomainValue>;
  timezone: Timezone;
}

export const HoverTooltip: React.SFC<HoverTooltipProps> = props => {
  const {
    stage,
    timezone,
    interaction: { datum },
    getX,
    getY,
    xScale,
    yScale
  } = props;
  const top = yScale(getY(datum));
  const xValue = getX(datum);
  const left = xScale.calculate(xValue) + (xScale.rangeBand() / 2);
  return <TooltipWithinStage
    stage={stage}
    top={top}
    left={left}>
    <SegmentBubbleContent
      title={formatValue(xValue, timezone)} />
  </TooltipWithinStage>;
};
