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
import { ConcreteSeries } from "../../../../../common/models/series/concrete-series";
import { Stage } from "../../../../../common/models/stage/stage";
import { Nullary, Unary } from "../../../../../common/utils/functional/functional";
import { LinearScale } from "../../../heat-map/utils/scales";
import { Interaction, isHighlight, isHover } from "../interactions/interaction";
import { DomainValue } from "../utils/x-domain";
import { XScale } from "../utils/x-scale";
import { HighlightModal } from "./highlight-modal";
import { HighlightOverlay } from "./highlight-overlay";
import { HoverTooltip } from "./hover-tooltip";

interface ForegroundProps {
  interaction: Interaction;
  container: React.RefObject<HTMLDivElement>;
  dropHighlight: Nullary<void>;
  acceptHighlight: Nullary<void>;
  xScale: XScale;
  yScale: LinearScale;
  series: ConcreteSeries;
  getX: Unary<Datum, DomainValue>;
  timezone: Timezone;
  stage: Stage;
}

export const Foreground: React.SFC<ForegroundProps> = props => {
  const { stage, dropHighlight, acceptHighlight, container, timezone, getX, series, xScale, yScale, interaction } = props;
  const rect = container.current.getBoundingClientRect();
  return <React.Fragment>
    {isHighlight(interaction) && <React.Fragment>
      <HighlightModal
        interaction={interaction}
        dropHighlight={dropHighlight}
        acceptHighlight={acceptHighlight}
        timezone={timezone}
        xScale={xScale}
        yScale={yScale}
        getX={getX}
        series={series}
        rect={rect} />
      <HighlightOverlay
        interaction={interaction}
        stage={stage}
        xScale={xScale}
        yScale={yScale}
        series={series}
        getX={getX} />
    </React.Fragment>}
    {isHover(interaction) && <HoverTooltip
      rect={rect}
      interaction={interaction}
      xScale={xScale}
      yScale={yScale}
      getX={getX}
      series={series}
      timezone={timezone} />}
  </React.Fragment>;
};
