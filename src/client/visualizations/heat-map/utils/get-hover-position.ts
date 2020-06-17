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

import { ScrollerLayout, ScrollerPart } from "../../../components/scroller/scroller";
import { LinearScale } from "../../../utils/linear-scale/linear-scale";

export interface HoverPosition {
  row: number;
  column: number;
  top: number;
  left: number;
}

export default function getHoverPosition(xScale: LinearScale, yScale: LinearScale, x: number, y: number, part: ScrollerPart, { left, top }: ScrollerLayout): HoverPosition | null {
  if (part !== "body") return null;

  const xOffset = x - left;
  const yOffset = y - top;
  const width = xScale.range()[1];
  const height = yScale.range()[0];

  if (xOffset > width || yOffset > height) return null;

  const column = Math.floor(xScale.invert(xOffset));
  const row = Math.floor(yScale.invert(yOffset));
  return {
    top: y,
    left: x,
    row,
    column
  };
}
