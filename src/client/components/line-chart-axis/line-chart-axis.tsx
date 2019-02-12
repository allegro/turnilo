/*
 * Copyright 2015-2016 Imply Data, Inc.
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
import * as d3 from "d3";
import * as React from "react";
import { Stage } from "../../../common/models/stage/stage";
import { Unary } from "../../../common/utils/functional/functional";
import { getMoment, scaleTicksFormatter } from "../../../common/utils/time/time";
import { roundToHalfPx } from "../../utils/dom/dom";
import "./line-chart-axis.scss";

const TICK_HEIGHT = 5;
const TEXT_OFFSET = 12;

type AxisScale = d3.time.Scale<number, number> | d3.time.Scale<number, number>;

export interface LineChartAxisProps {
  stage: Stage;
  ticks: Array<Date | number>;
  scale: AxisScale;
  timezone: Timezone;
}

const floatFormat = d3.format(".1f");

function labelFormatter(scale: AxisScale, timezone: Timezone): Unary<Date | number, string> {
  const [start] = scale.domain();
  if (start instanceof Date) {
    const formatter = scaleTicksFormatter(scale);
    return (date: Date) => formatter(getMoment(date, timezone));
  }
  return (value: number) => String(floatFormat(value));
}

export const LineChartAxis: React.SFC<LineChartAxisProps> = props => {

  const { stage, ticks, scale, timezone } = props;

  const format = labelFormatter(scale, timezone);

  const lines = ticks.map((tick: any) => {
    const x = roundToHalfPx(scale(tick));
    return <line key={String(tick)} x1={x} y1={0} x2={x} y2={TICK_HEIGHT} />;
  });

  const labelY = TICK_HEIGHT + TEXT_OFFSET;
  const labels = ticks.map((tick: any) => {
    const x = scale(tick);
    return <text key={String(tick)} x={x} y={labelY}>{format(tick)}</text>;
  });

  return <g className="line-chart-axis" transform={stage.getTransform()}>
    {lines}
    {labels}
  </g>;
};
