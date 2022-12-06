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

import { colorSplitLimits, VisualizationColors } from "../../models/colors/colors";
import { Dimension } from "../../models/dimension/dimension";
import { SeriesList } from "../../models/series-list/series-list";
import { DimensionSort, SeriesSort, SortDirection } from "../../models/sort/sort";
import { Split, SplitType } from "../../models/split/split";
import { thread } from "../functional/functional";

export function adjustColorSplit(split: Split, dimension: Dimension, series: SeriesList, visualizationColors: VisualizationColors): Split {
  const colorsCount = visualizationColors.series.length;
  return thread(
    split,
    adjustSort(dimension, series),
    adjustFiniteLimit(colorSplitLimits(colorsCount), colorsCount)
  );
}

export function adjustContinuousSplit(split: Split): Split {
  const { reference } = split;
  return split
    .changeLimit(null)
    .changeSort(new DimensionSort({
      reference,
      direction: SortDirection.ascending
    }));
}

export function adjustLimit({ kind, limits }: Dimension) {
  const isTimeSplit = kind === "time";
  const availableLimits = isTimeSplit ? [...limits, null] : limits;
  return adjustFiniteLimit(availableLimits);
}

export function adjustFiniteLimit(availableLimits: number[], defaultLimit = availableLimits[0]) {
  return (split: Split): Split => {
    const { limit } = split;
    return availableLimits.indexOf(limit) === -1
      ? split.changeLimit(defaultLimit)
      : split;
  };
}

export function adjustSort(dimension: Dimension, series: SeriesList, availableDimensions = [dimension.name]) {
  return (split: Split): Split => {
    const { sort } = split;
    if (sort instanceof SeriesSort) return split;
    if (availableDimensions.indexOf(sort.reference) !== -1) return split;
    const direction = SortDirection.descending;
    const { sortStrategy } = dimension;
    if (sortStrategy) {
      if (sortStrategy === "self" || split.reference === sortStrategy) {
        return split.changeSort(new DimensionSort({
          reference: split.reference,
          direction
        }));
      }
      if (series.hasMeasureSeries(sortStrategy)) {
        return split.changeSort(new SeriesSort({
          reference: sortStrategy,
          direction
        }));
      }
    }
    if (split.type === SplitType.string) {
      return split.changeSort(new SeriesSort({
        reference: series.series.first().reference,
        direction: SortDirection.descending
      }));
    }
    return split.changeSort(new DimensionSort({
      reference: split.reference,
      direction
    }));
  };
}
