/*
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

import { Dimension } from "../dimension/dimension";
import { Essence } from "../essence/essence";
import { ConcreteSeries, SeriesDerivation } from "../series/concrete-series";
import { DimensionSort, SeriesSort, Sort, SortDirection, SortType } from "../sort/sort";

export abstract class SortOn {

  static fromSort(sort: Sort, essence: Essence): SortOn {
    const { type, reference } = sort;
    switch (type) {
      case SortType.DIMENSION:
        const dimension = essence.dataCube.getDimension(reference);
        return new DimensionSortOn(dimension);
      case SortType.SERIES:
        const period = (sort as SeriesSort).period;
        const series = essence.findConcreteSeries(reference);
        return new SeriesSortOn(series, period);
    }
  }

  static getKey(sortOn: SortOn): string {
    return sortOn.key;
  }

  static getTitle(sortOn: SortOn): string {
    return sortOn.title;
  }

  static equals(sortOn: SortOn, other: SortOn): boolean {
    if (!sortOn) return sortOn === other;
    return sortOn.equals(other);
  }

  protected constructor(public key: string, protected title: string, protected period?: SeriesDerivation) {
  }

  abstract equals(other: SortOn): boolean;

  abstract toSort(direction: SortDirection): Sort;
}

export class DimensionSortOn extends SortOn {

  constructor(dimension: Dimension) {
    super(dimension.name, dimension.title);
  }

  equals(other: SortOn): boolean {
    return other instanceof DimensionSortOn
      && this.key === other.key
      && this.title === other.title;
  }

  toSort(direction: SortDirection): Sort {
    return new DimensionSort({ direction, reference: this.key });
  }
}

export class SeriesSortOn extends SortOn {

  constructor(series: ConcreteSeries, period = SeriesDerivation.CURRENT) {
    super(series.definition.key(), series.title(period), period);
  }

  equals(other: SortOn): boolean {
    return other instanceof SeriesSortOn
      && this.key === other.key
      && this.title === other.title
      && this.period === other.period;
  }

  toSort(direction: SortDirection): Sort {
    return new SeriesSort({ reference: this.key, direction, period: this.period });
  }

}
