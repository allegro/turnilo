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

import { TimeRange } from "plywood";
import * as React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import { Stage } from "../../../../../common/models/stage/stage";
import { formatStartOfTimeRange } from "../../../../../common/utils/time/time";
import { roundToHalfPx } from "../../../../utils/dom/dom";
import { XDomain } from "../utils/x-domain";
import { formatDomainValue, OrdinalScale } from "../utils/x-scale";
import "./x-axis.scss";

interface XAxisProps {
  essence: Essence;
  stage: Stage;
  scale: OrdinalScale;
  domain: XDomain;
}

const TICK_HEIGHT = 10;

function calculateTicks(domain: XDomain, essence: Essence): any[] {
  return domain.filter((_, idx) => idx % 5 === 0);
}

export const XAxis: React.SFC<XAxisProps> = props => {
  const { domain, essence, stage, scale } = props;
  const ticks = calculateTicks(domain, essence);
  return <svg width={stage.width} height={stage.height}>
    <g className="bar-chart-x-axis">
      {ticks.map(value => {
        const x = roundToHalfPx(scale(formatDomainValue(value)));
        return <g key={value} transform={`translate(${x}, 0)`}>
            <line key={value} x1={0} x2={0} y1={0} y2={TICK_HEIGHT} />
            <text y={TICK_HEIGHT + 12} style={{ textAnchor: "start" }}>
              {formatStartOfTimeRange(value as TimeRange, essence.timezone)}
            </text>
        </g>;
      })}
    </g>
  </svg>;
};
