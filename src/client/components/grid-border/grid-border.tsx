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
import { Stage } from "../../../common/models/stage/stage";
import { roundToHalfPx } from "../../utils/dom/dom";
import "./grid-border.scss";

interface BottomBorderProps {
  stage: Stage;
  tickLength: number;
}

export const BottomBorder: React.FunctionComponent<BottomBorderProps> = ({ stage, tickLength }) => {
  return <line
    className="grid-border grid-bottom-border"
    transform={stage.getTransform()}
    x1={0}
    x2={stage.width + tickLength}
    y1={roundToHalfPx(stage.height - 1)}
    y2={roundToHalfPx(stage.height - 1)}
  />;
};

interface RightBorderProps {
 stage: Stage;
}

export const RightBorder: React.FunctionComponent<RightBorderProps> = ({ stage }) => {
  return <line
    className="grid-border grid-right-border"
    transform={stage.getTransform()}
    x1={roundToHalfPx(stage.width - 1)}
    x2={roundToHalfPx(stage.width - 1)}
    y1={0}
    y2={stage.height} />;
};
