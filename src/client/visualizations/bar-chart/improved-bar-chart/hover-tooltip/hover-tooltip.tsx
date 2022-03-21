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
import { ConcreteSeries } from "../../../../../common/models/series/concrete-series";
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
  model: BarChartModel;
  rect: ClientRect | DOMRect;
}

export const HoverTooltip: React.FunctionComponent<HoverTooltipProps> = props => {
  const {
    model,
    rect: { left, top },
    interaction: { datum },
    series,
    xScale,
    yScale
  } = props;
  const { continuousSplit, timezone } = model;
  const y = yScale(series.selectValue(datum));
  const xValue = continuousSplit.selectValue<DomainValue>(datum);
  const x = xScale.calculate(xValue) + (xScale.bandwidth() / 2);
  return <SegmentBubble
    top={top + y}
    left={left + x}
    title={continuousSplit.formatValue(datum, timezone)}
    content={<Content model={model} datum={datum} series={series}/>} />;
};
