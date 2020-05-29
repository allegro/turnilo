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
import { roundToHalfPx } from "../../../../utils/dom/dom";
import { OrdinalScale } from "../utils/x-scale";
import "./x-axis.scss";

interface XAxisProps {
  stage: Stage;
  scale: OrdinalScale;
}

const TICK_HEIGHT = 10;

export const XAxis: React.SFC<XAxisProps> = props => {
  const { stage, scale } = props;
  return <svg width={stage.width} height={stage.height}>
    <g className="bar-chart-x-axis">
      {scale.domain().map(value => {
        const x = roundToHalfPx(scale(value));
        return <line key={value} x1={x} x2={x} y1={0} y2={TICK_HEIGHT} />;
      })}
    </g>
  </svg>;
};
