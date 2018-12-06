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
import { SeriesDerivation } from "../../../common/models/series/series";

export default function tabularOptions(essence: Essence): TabulatorOptions {
  return {
    attributeFilter: ({ name }: AttributeInfo) => {
      return !name.startsWith("__formula");
    },
    attributeTitle: ({ name }: AttributeInfo) => {
      // TODO: What if Derivation could become part of series?
      const dataSeries = essence.getDataSeries();
      const currentSeries = dataSeries.find(series => series.fullName() === name);
      if (currentSeries) {
        return currentSeries.title();
      }
      const previousSeries = dataSeries.find(series => series.fullName(SeriesDerivation.PREVIOUS) === name);
      if (previousSeries) {
        return previousSeries.title(SeriesDerivation.PREVIOUS);
      }
      const deltaSeries = dataSeries.find(series => series.fullName(SeriesDerivation.DELTA) === name);
      if (deltaSeries) {
        return deltaSeries.title(SeriesDerivation.DELTA);
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
