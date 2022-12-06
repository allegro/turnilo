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

import { hsl, range, rgb } from "d3";

export const DEFAULT_SERIES_COLORS = [
  "#2D95CA",
  "#EFB925",
  "#DA4E99",
  "#4CC873",
  "#745CBD",
  "#EA7136",
  "#E68EE0",
  "#218C35",
  "#B0B510",
  "#904064"
];

export const DEFAULT_MAIN_COLOR = "#FF5900";

export const DEFAULT_COLORS: VisualizationColors = {
  main: DEFAULT_MAIN_COLOR,
  series: DEFAULT_SERIES_COLORS
};

export interface VisualizationColors {
  main: string;
  series: string[];
}

export function lightMain(colors: VisualizationColors): string {
  return hsl(colors.main).brighter(1.3).toString();
}

export function alphaMain(colors: VisualizationColors): string {
  const { r, g, b } = rgb(colors.main);
  return `rgba(${r}, ${g}, ${b}, ${0.14})`;
}

export function colorSplitLimits(max: number): number[] {
  const limits = range(5, max, 5);
  if (limits[limits.length - 1] < max) {
    return [...limits, max];
  }
  return limits;
}
