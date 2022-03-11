/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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
import { Stage } from "../../../common/models/stage/stage";
import { Unary } from "../../../common/utils/functional/functional";
import { roundToHalfPx } from "../../utils/dom/dom";
import "./vertical-axis.scss";

const TEXT_OFFSET = 2;

export interface VerticalAxisProps {
  stage: Stage;
  ticks: number[];
  tickSize: number;
  scale: any;
  formatter: Unary<number, string>;
  topLineExtend?: number;
  hideZero?: boolean;
}

export const VerticalAxis: React.FunctionComponent<VerticalAxisProps> = ({ formatter, stage, tickSize, ticks: inputTicks, scale, topLineExtend = 0, hideZero }) => {
  const ticks = hideZero ? inputTicks.filter((tick: number) => tick !== 0) : inputTicks;

  const lines = ticks.map((tick: any) => {
    const y = roundToHalfPx(scale(tick));
    return <line className="tick" key={String(tick)} x1={0} y1={y} x2={tickSize} y2={y} />;
  });

  const labelX = tickSize + TEXT_OFFSET;
  const dy = "0.31em";

  const labels = ticks.map((tick: any) => {
    const y = scale(tick);
    return <text className="tick" key={String(tick)} x={labelX} y={y} dy={dy}>{formatter(tick)}</text>;
  });

  return <g className="vertical-axis" transform={stage.getTransform()}>
    <line className="border" x1={0.5} y1={-topLineExtend} x2={0.5} y2={stage.height} />
    {lines}
    {labels}
  </g>;
};
