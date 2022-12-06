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
  "#4E79A7",
  "#A0CBE8",
  "#F28E2B",
  "#FFBE7D",
  "#59A14F",
  "#8CD17D",
  "#B6992D",
  "#F1CE63",
  "#499894",
  "#86BCB6",
  "#E15759",
  "#FF9D9A",
  "#79706E",
  "#BAB0AC",
  "#D37295",
  "#FABFD2",
  "#B07AA1",
  "#D4A6C8",
  "#9D7660",
  "#D7B5A6"
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
