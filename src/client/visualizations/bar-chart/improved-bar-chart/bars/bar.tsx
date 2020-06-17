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

import { Datum } from "plywood";
import * as React from "react";
import { Unary } from "../../../../../common/utils/functional/functional";
import { LinearScale } from "../../../../utils/scales/scales";
import { DomainValue } from "../utils/x-domain";
import { XScale } from "../utils/x-scale";

interface BarProps {
  datum: Datum;
  yScale: LinearScale;
  xScale: XScale;
  getY: Unary<Datum, number>;
  getX: Unary<Datum, DomainValue>;
  maxHeight: number;
}

export const BAR_PADDING = 3;

export const Bar: React.SFC<BarProps> = props => {
  const { datum, xScale, yScale, getX, getY, maxHeight } = props;
  const x = getX(datum);
  const xPos = xScale.calculate(x) + BAR_PADDING;
  const width = xScale.rangeBand() - (2 * BAR_PADDING);
  const y = getY(datum);
  const yPos = yScale(y);
  const height = maxHeight - yPos;

  return <rect
    className="bar-chart-bar"
    x={xPos}
    y={yPos}
    width={width}
    height={height} />;
};
