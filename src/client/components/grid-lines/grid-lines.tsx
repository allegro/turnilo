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
import { classNames, roundToHalfPx } from "../../utils/dom/dom";
import "./grid-lines.scss";

export interface GridLinesProps {
  orientation: "horizontal" | "vertical";
  stage: Stage;
  ticks: unknown[];
  scale: Unary<unknown, number>;
}

interface Coordinates {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

function lineCoordinates(orientation: "horizontal" | "vertical", value: number, stage: Stage): Coordinates {
  switch (orientation) {
    case "horizontal":
      return { x1: 0, x2: stage.width, y1: value, y2: value };
    case "vertical":
      return { x1: value, x2: value, y1: 0, y2: stage.height };
  }
}

export const GridLines: React.FunctionComponent<GridLinesProps> = props => {
  const { orientation, stage, ticks, scale } = props;

  return <g className={classNames("grid-lines", orientation)} transform={stage.getTransform()}>
    {ticks.map((tick: unknown) => {
      const value = roundToHalfPx(scale(tick));
      const coordinates = lineCoordinates(orientation, value, stage);
      return <line key={String(tick)} {...coordinates} />;
    })}
  </g>;
};
