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

import { List } from "immutable";
import { AttributeInfo, TabulatorOptions, TimeRange } from "plywood";
import { Essence } from "../../../common/models/essence/essence";
import { ConcreteSeries, SeriesDerivation } from "../../../common/models/series/concrete-series";

interface SeriesWithDerivation {
  series: ConcreteSeries;
  derivation: SeriesDerivation;
}

function findSeriesAndDerivation(name: string, concreteSeriesList: List<ConcreteSeries>): SeriesWithDerivation {
  for (const derivation of [SeriesDerivation.CURRENT, SeriesDerivation.PREVIOUS, SeriesDerivation.DELTA]) {
    const series = concreteSeriesList.find(s => s.plywoodKey(derivation) === name);
    if (series) {
      return { series, derivation };
    }
  }
  return null;
}

export default function tabularOptions(essence: Essence): TabulatorOptions {
  return {
    formatter: {
      TIME_RANGE: (range: TimeRange) => range.start.toISOString()
    },
    attributeFilter: ({ name }: AttributeInfo) => {
      return findSeriesAndDerivation(name, essence.getConcreteSeries()) !== null
        || essence.dataCube.getDimension(name) !== undefined;
    },
    attributeTitle: ({ name }: AttributeInfo) => {
      const seriesWithDerivation = findSeriesAndDerivation(name, essence.getConcreteSeries());
      if (seriesWithDerivation) {
        const { series, derivation } = seriesWithDerivation;
        return series.title(derivation);
      }
      const dimension = essence.dataCube.getDimension(name);
      if (dimension) {
        return dimension.title;
      }
      return name;
    },
    timezone: essence.timezone
  };
}
