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

import React from "react";
import { isContinuousSplit } from "../../../../../common/models/split/split";
import { Stage } from "../../../../../common/models/stage/stage";
import { formatShortSegment } from "../../../../../common/utils/formatter/formatter";
import { roundToHalfPx } from "../../../../utils/dom/dom";
import { BarChartModel } from "../utils/bar-chart-model";
import { DomainValue, XDomain } from "../utils/x-domain";
import { XScale } from "../utils/x-scale";
import "./x-axis.scss";

interface XAxisProps {
  model: BarChartModel;
  stage: Stage;
  scale: XScale;
}

const TICK_HEIGHT = 10;
const TICK_TEXT_OFFSET = 12;

function calculateTicks(domain: XDomain, { continuousSplit }: BarChartModel): DomainValue[] {
  if (isContinuousSplit(continuousSplit)) {
    return domain.filter((_, idx) => idx % 8 === 0);
  }
  return domain;
}

export const XAxis: React.FunctionComponent<XAxisProps> = props => {
  const { model, stage, scale } = props;
  const ticks = calculateTicks(scale.domain(), model);
  return <svg width={stage.width} height={stage.height}>
    <g className="bar-chart-x-axis">
      {ticks.map((value, index) => {
        const x = roundToHalfPx(scale.calculate(value));
        const textAnchor = index === 0 ? "start" : "middle";
        return <g key={String(value)} transform={`translate(${x}, 0)`}>
          <line x1={0} x2={0} y1={0} y2={TICK_HEIGHT} />
          <text y={TICK_HEIGHT + TICK_TEXT_OFFSET} style={{ textAnchor }}>
            {formatShortSegment(value, model.timezone)}
          </text>
        </g>;
      })}
    </g>
  </svg>;
};
