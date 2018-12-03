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
import { DataSeries } from "../../../common/models/data-series/data-series";
import { Essence } from "../../../common/models/essence/essence";
import { SeriesDerivation } from "../../../common/models/series/series";

export default function tabularOptions(essence: Essence): TabulatorOptions {
  return {
    attributeTitle: ({ name }: AttributeInfo) => {
      // TODO: make function nominalName -> title
      const { derivation, name: measureName } = DataSeries.nominalName(name);
      const measure = essence.dataCube.getMeasure(measureName);
      if (measure) {
        switch (derivation) {
          case SeriesDerivation.CURRENT:
            return measure.title;
          case SeriesDerivation.PREVIOUS:
            return `Previous ${measure.title}`;
          case SeriesDerivation.DELTA:
            return `Difference ${measure.title}`;
        }
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
