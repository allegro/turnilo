/*
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

import { Record } from "immutable";
import { $, Direction, SortExpression } from "plywood";
import { RequireOnly } from "../../utils/functional/functional";
import { SeriesDerivation } from "../series/concrete-series";
import { MeasureSeries } from "../series/measure-series";

export enum SortType { SERIES = "series", DIMENSION = "dimension" }

export enum SortDirection {
  ascending = "ascending",
  descending = "descending"
}

export const sortDirectionMapper: { [sort in SortDirection]: Direction; } = {
  ascending: "ascending",
  descending: "descending"
};

interface BaseSortDefinition {
  reference: string;
  type: SortType;
  direction: SortDirection;
}

interface SortBehaviour {
  toExpression(): SortExpression;
}

export type Sort = SeriesSort | DimensionSort;

interface SeriesSortDefinition extends BaseSortDefinition {
  type: SortType.SERIES;
  period: SeriesDerivation;
}

const defaultSeriesSort: SeriesSortDefinition = {
  reference: null,
  type: SortType.SERIES,
  direction: SortDirection.descending,
  period: SeriesDerivation.CURRENT
};

export class SeriesSort extends Record<SeriesSortDefinition>(defaultSeriesSort) implements SortBehaviour {
  constructor(params: RequireOnly<SeriesSortDefinition, "reference">) {
    super(params);
  }

  toExpression(): SortExpression {
    const series = new MeasureSeries({ reference: this.reference });
    return new SortExpression({
      direction: sortDirectionMapper[this.direction],
      expression: $(series.plywoodKey(this.period))
    });
  }
}

interface DimensionSortDefinition extends BaseSortDefinition {
  type: SortType.DIMENSION;
}

const defaultDimensionSort: DimensionSortDefinition = {
  reference: null,
  type: SortType.DIMENSION,
  direction: SortDirection.descending
};

export class DimensionSort extends Record<DimensionSortDefinition>(defaultDimensionSort) implements SortBehaviour {
  constructor(params: RequireOnly<DimensionSortDefinition, "reference">) {
    super(params);
  }

  toExpression(): SortExpression {
    return new SortExpression(({
      direction: sortDirectionMapper[this.direction],
      expression: $(this.reference)
    }));
  }
}

export function isSortEmpty(sort: Sort): boolean {
  return sort.reference === null;
}
