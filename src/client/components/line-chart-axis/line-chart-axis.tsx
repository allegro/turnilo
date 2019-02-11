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
import { Moment, tz } from "moment-timezone";
import * as React from "react";
import { Stage } from "../../../common/models/stage/stage";
import { Unary } from "../../../common/utils/functional/functional";
import { roundToHalfPx } from "../../utils/dom/dom";
import "./line-chart-axis.scss";

const TICK_HEIGHT = 5;
const TEXT_OFFSET = 12;

type AxisScale = d3.time.Scale<Date, number> | d3.time.Scale<number, number>;

export interface LineChartAxisProps {
  stage: Stage;
  ticks: Array<Date | number>;
  scale: AxisScale;
  timezone: Timezone;
}

type TimeFormatter = Unary<Moment, string>;

const formatterFromDef = (format: string): TimeFormatter => time => time.format(format);

// Formats are simillar to utils/time.ts for now. In the end we should define somewhere "short formats" for use in LineChart due to limited available space.
export function pickFormatDefinition(scale: AxisScale): string {
  const ticks = scale.ticks();
  if (ticks.length < 2) return "D MMM YYYY H:mm";
  const first = ticks[0];
  const last = ticks[ticks.length - 1];
  if (first.getFullYear() !== last.getFullYear()) {
    return "D MMM YYYY";
  }
  if (first.getMonth() !== last.getMonth()) {
    return "D MMM";
  }
  if (last.getDate() - first.getDate() === 1) {
    return "D H:mm";
  }
  if (first.getDate() !== last.getDate()) {
    return "dd D";
  }
  return "H:mm";
}

const floatFormat = d3.format(".1f");

function labelFormatter(scale: AxisScale, timezone: Timezone): Unary<Date | number, string> {
  const [start] = scale.domain();
  if (start instanceof Date) {
    const formatDef = pickFormatDefinition(scale);
    const timeFormatter = formatterFromDef(formatDef);
    const timezoneString = timezone.toString();
    return (value: Date) => timeFormatter(tz(value, timezoneString));
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
