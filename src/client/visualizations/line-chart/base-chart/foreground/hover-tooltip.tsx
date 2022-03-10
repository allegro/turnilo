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
import React from "react";
import { ReactNode } from "react";
import { Stage } from "../../../../../common/models/stage/stage";
import { formatValue } from "../../../../../common/utils/formatter/formatter";
import { SegmentBubbleContent } from "../../../../components/segment-bubble/segment-bubble";
import { TooltipWithinStage } from "../../../../components/tooltip-within-stage/tooltip-within-stage";
import { Hover } from "../../interactions/interaction";
import { ContinuousScale } from "../../utils/continuous-types";

interface HoverTooltipProps {
  interaction: Hover;
  xScale: ContinuousScale;
  timezone: Timezone;
  content: ReactNode;
  stage: Stage;
}

export const HoverTooltip: React.FunctionComponent<HoverTooltipProps> = props => {
  const { content, interaction, xScale, timezone, stage } = props;
  const { range } = interaction;
  const x = xScale(range.midpoint());

  return <TooltipWithinStage key={x} top={60} left={x} stage={stage}>
    <SegmentBubbleContent
      title={formatValue(range, timezone)}
      content={content} />
  </TooltipWithinStage>;
};
