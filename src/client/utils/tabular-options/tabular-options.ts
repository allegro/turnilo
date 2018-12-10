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

import { AttributeInfo, TabulatorOptions } from "plywood";
import { Essence } from "../../../common/models/essence/essence";
import { SeriesDerivation } from "../../../common/models/series/series-definition";

function titleFromDataSeries(essence: Essence, name: string) {
  // TODO: What if Derivation could become part of series?
  const dataSeries = essence.getDataSeries();
  for (const derivation of [SeriesDerivation.CURRENT, SeriesDerivation.PREVIOUS, SeriesDerivation.DELTA]) {
    const currentSeries = dataSeries.find(series => series.plywoodExpressionName(derivation) === name);
    if (currentSeries) {
      return currentSeries.title(derivation);
    }
  }
  return null;
}

function titleForDimension(essence: Essence, name: string) {
  const dimension = essence.dataCube.getDimension(name);
  return dimension ? dimension.title : null;
}

export default function tabularOptions(essence: Essence): TabulatorOptions {
  return {
    attributeFilter: ({ name }: AttributeInfo) => {
      return !name.startsWith("__formula");
    },
    attributeTitle: ({ name }: AttributeInfo) => {
      const dataSeriesTitle = titleFromDataSeries(essence, name);
      if (dataSeriesTitle) return dataSeriesTitle;
      const dimensionTitle = titleForDimension(essence, name);
      if (dimensionTitle) return dimensionTitle;
      return name;
    },
    timezone: essence.timezone
  };
}
