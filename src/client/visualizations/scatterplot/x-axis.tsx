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

const TEXT_OFFSET_X = 16;

interface XAxisProps {
  stage: Stage;
  ticks: number[];
  tickSize: number;
  scale: LinearScale;
  formatter: Unary<number, string>;
}

export const XAxis: React.FunctionComponent<XAxisProps> = ({ stage, ticks, scale, formatter, tickSize }) => {
  const labelY = tickSize + TEXT_OFFSET_X;
  const linePositionY = roundToHalfPx(0);
  const lines = ticks.map((tick: number) => {
    const x = roundToHalfPx(scale(tick));
    return <line className="tick" key={String(tick)} x1={x} y1={0} x2={x} y2={tickSize} />;
  });
  const labels = ticks.map((tick: number) => {
    const x = scale(tick);
    return <text className="label axis-label-x" key={String(tick)} x={x} y={labelY}>{formatter(tick)}</text>;
  });

  return (<g className="axis axis-x" transform={stage.getTransform()}>
    {lines}
    {labels}
    <line className="border" y1={linePositionY} y2={linePositionY} x1={0} x2={stage.width}/>
  </g>);
};
