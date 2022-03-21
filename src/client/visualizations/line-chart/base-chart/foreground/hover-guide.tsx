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

import * as d3 from "d3";
import React from "react";
import { Stage } from "../../../../../common/models/stage/stage";
import { Hover } from "../../interactions/interaction";
import { ContinuousScale } from "../../utils/continuous-types";

interface HoverGuideProps {
  hover: Hover;
  stage: Stage;
  yScale: d3.ScaleLinear<number, number>;
  xScale: ContinuousScale;
}

export const HoverGuide: React.FunctionComponent<HoverGuideProps> = props => {
  const { stage, hover: { range }, yScale, xScale } = props;
  const midpoint = range.midpoint();
  const x = xScale(midpoint);
  const [y2, y1] = yScale.range();
  return <line
    transform={stage.getTransform()}
    x1={x}
    x2={x}
    y1={0}
    y2={stage.height}
    className="hover-guide" />;
};
