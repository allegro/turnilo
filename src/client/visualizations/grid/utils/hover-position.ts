/*
 * Copyright 2017-2021 Allegro.pl
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

import { Dimension } from "../../../../common/models/dimension/dimension";
import { findDimensionByName } from "../../../../common/models/dimension/dimensions";
import { Essence } from "../../../../common/models/essence/essence";
import { SeriesDerivation } from "../../../../common/models/series/concrete-series";
import { Series } from "../../../../common/models/series/series";
import { integerDivision } from "../../../../common/utils/general/general";

interface WhiteSpace {
  element: "whitespace";
}

interface SeriesPosition {
  element: "series";
  series: Series;
  period: SeriesDerivation;
}

interface DimensionPosition {
  element: "dimension";
  dimension: Dimension;
}

export type Position = WhiteSpace | SeriesPosition | DimensionPosition;

export function splitPosition(x: number, essence: Essence, segmentWidth: number): Position {
  const splitCount = essence.splits.length();
  const splitColumnWidth = segmentWidth / splitCount;
  const splitIndex = Math.floor(x / splitColumnWidth);
  const split = essence.splits.getSplit(splitIndex);
  const dimension = findDimensionByName(essence.dataCube.dimensions, split.reference);
  if (!dimension) {
    return { element: "whitespace" };
  }
  return { element: "dimension", dimension };
}

function indexToPeriod(index: number): SeriesDerivation {
  return [SeriesDerivation.CURRENT, SeriesDerivation.PREVIOUS, SeriesDerivation.DELTA][index % 3];
}

export function seriesPosition(x: number, essence: Essence, segmentWidth: number, columnWidth: number): Position {
  const seriesList = essence.series.series;
  const xOffset = x - segmentWidth;
  const seriesIndex = Math.floor(xOffset / columnWidth);
  if (essence.hasComparison()) {
    const nominalIndex = integerDivision(seriesIndex, 3);
    const series = seriesList.get(nominalIndex);
    if (!series) return { element: "whitespace" };
    const period = indexToPeriod(seriesIndex);
    return { element: "series", series, period };
  }
  const series = seriesList.get(seriesIndex);
  if (!series) return { element: "whitespace" };
  return { element: "series", series, period: SeriesDerivation.CURRENT };
}
