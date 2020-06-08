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
import { Stage } from "../../../../../common/models/stage/stage";
import { Nullary } from "../../../../../common/utils/functional/functional";
import { Interaction, isHighlight, isHover } from "../../interactions/interaction";
import { ContinuousScale } from "../../utils/continuous-types";
import { HighlightModal } from "./highlight-modal";
import { HoverTooltip } from "./hover-tooltip";
import { SelectionOverlay } from "./selection-overlay";

interface ForegroundProps {
  interaction: Interaction;
  stage: Stage;
  visualisationStage: Stage;
  container: React.RefObject<HTMLDivElement>;
  dropHighlight: Nullary<void>;
  acceptHighlight: Nullary<void>;
  hoverContent?: ReactNode;
  xScale: ContinuousScale;
  timezone: Timezone;
}

export const Foreground: React.SFC<ForegroundProps> = props => {
  const { stage, interaction, container, xScale, timezone, visualisationStage, hoverContent, dropHighlight, acceptHighlight } = props;

  return <React.Fragment>
    <SelectionOverlay
      stage={stage}
      interaction={interaction}
      timezone={timezone}
      xScale={xScale} />
    {isHover(interaction) && <HoverTooltip
      stage={visualisationStage}
      interaction={interaction}
      xScale={xScale}
      content={hoverContent}
      timezone={timezone} />}
    {isHighlight(interaction) && <HighlightModal
      rect={container.current.getBoundingClientRect()}
      interaction={interaction}
      xScale={xScale}
      timezone={timezone}
      dropHighlight={dropHighlight}
      acceptHighlight={acceptHighlight} />}
  </React.Fragment>;
};
