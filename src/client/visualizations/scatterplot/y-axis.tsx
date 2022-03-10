/*
 * Copyright 2017-2022 Allegro.pl
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

import "./scatterplot.scss";

import { Stage } from "../../../common/models/stage/stage";
import { Unary } from "../../../common/utils/functional/functional";
import { roundToHalfPx } from "../../utils/dom/dom";
import { LinearScale } from "../../utils/linear-scale/linear-scale";

const TEXT_OFFSET_Y = 4;

interface YAxisProps {
  stage: Stage;
  ticks: number[];
  tickSize: number;
  scale: LinearScale;
  formatter: Unary<number, string>;
}

export const YAxis: React.FunctionComponent<YAxisProps> = ({ formatter, stage, tickSize, ticks, scale }) => {
  const linePositionX = roundToHalfPx(stage.width);

  const lines = ticks.map((tick: number) => {
    const y = roundToHalfPx(scale(tick));
    return <line className="tick" key={String(tick)} x1={stage.width - tickSize} y1={y} x2={stage.width} y2={y} />;
  });

  const labels = ticks.map((tick: number) => {
    const y = scale(tick);
    const labelX = y + TEXT_OFFSET_Y;
    return <text className="label" key={String(tick)} x={0} y={labelX}>{formatter(tick)}</text>;
  });

  return <g className="axis axis-y" transform={stage.getTransform()}>
    <line className="border" x1={linePositionX} y1={0} x2={linePositionX} y2={stage.height} />
    {lines}
    {labels}
  </g>;
};
