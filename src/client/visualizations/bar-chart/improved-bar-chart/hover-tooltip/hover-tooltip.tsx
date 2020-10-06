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
import { ConcreteSeries } from "../../../../../common/models/series/concrete-series";
import { formatValue } from "../../../../../common/utils/formatter/formatter";
import { Unary } from "../../../../../common/utils/functional/functional";
import { SegmentBubble } from "../../../../components/segment-bubble/segment-bubble";
import { LinearScale } from "../../../../utils/linear-scale/linear-scale";
import { Hover } from "../interactions/interaction";
import { BarChartModel } from "../utils/bar-chart-model";
import { DomainValue } from "../utils/x-domain";
import { XScale } from "../utils/x-scale";
import { Content } from "./tooltip-content";

interface HoverTooltipProps {
  interaction: Hover;
  xScale: XScale;
  yScale: LinearScale;
  series: ConcreteSeries;
  getX: Unary<Datum, DomainValue>;
  model: BarChartModel;
  rect: ClientRect | DOMRect;
}

export const HoverTooltip: React.SFC<HoverTooltipProps> = props => {
  const {
    model,
    rect: { left, top },
    interaction: { datum },
    getX,
    series,
    xScale,
    yScale
  } = props;
  const y = yScale(series.selectValue(datum));
  const xValue = getX(datum);
  const x = xScale.calculate(xValue) + (xScale.rangeBand() / 2);
  return <SegmentBubble
    top={top + y}
    left={left + x}
    title={formatValue(xValue, model.timezone)}
    content={<Content model={model} datum={datum} series={series}/>} />;
};
