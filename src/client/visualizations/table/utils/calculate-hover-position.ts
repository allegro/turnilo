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

import { Datum, PseudoDatum } from "plywood";
import { Essence } from "../../../../common/models/essence/essence";
import { SeriesDerivation } from "../../../../common/models/series/concrete-series";
import { Series } from "../../../../common/models/series/series";
import { integerDivision } from "../../../../common/utils/general/general";
import { HEADER_HEIGHT, ROW_HEIGHT } from "../table";

function indexToPeriod(index: number): SeriesDerivation {
  return [SeriesDerivation.CURRENT, SeriesDerivation.PREVIOUS, SeriesDerivation.DELTA][index % 3];
}

export enum HoverElement { CORNER, ROW, HEADER, WHITESPACE }

interface RowHover {
  element: HoverElement.ROW;
  datum: Datum;
}

interface SeriesHover {
  element: HoverElement.HEADER;
  series: Series;
  period: SeriesDerivation;
}

interface CornerHover {
  element: HoverElement.CORNER;
}

interface WhiteSpaceHover {
  element: HoverElement.WHITESPACE;
}

export type PositionHover = RowHover | SeriesHover | CornerHover | WhiteSpaceHover;

export function seriesPosition(x: number, essence: Essence, segmentWidth: number, columnWidth: number): PositionHover {
  const seriesList = essence.series.series;
  const xOffset = x - segmentWidth;
  const seriesIndex = Math.floor(xOffset / columnWidth);
  if (essence.hasComparison()) {
    const nominalIndex = integerDivision(seriesIndex, 3);
    const series = seriesList.get(nominalIndex);
    if (!series) return { element: HoverElement.WHITESPACE };
    const period = indexToPeriod(seriesIndex);
    return { element: HoverElement.HEADER, series, period };
  }
  const series = seriesList.get(seriesIndex);
  if (!series) return { element: HoverElement.WHITESPACE };
  return { element: HoverElement.HEADER, series, period: SeriesDerivation.CURRENT };
}

export function rowPosition(y: number, data: PseudoDatum[]): PositionHover {
  const yOffset = y - HEADER_HEIGHT;
  const rowIndex = Math.floor(yOffset / ROW_HEIGHT);
  const datum = data ? data[rowIndex] : null;
  if (!datum) return { element: HoverElement.WHITESPACE };
  return { element: HoverElement.ROW, datum };
}
