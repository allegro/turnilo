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

import { Timezone } from "chronoshift";
import { List, OrderedSet } from "immutable";
import { NamedArray } from "immutable-class";
import { DataCube } from "../../models/data-cube/data-cube";
import { Essence } from "../../models/essence/essence";
import { Filter } from "../../models/filter/filter";
import { Manifest } from "../../models/manifest/manifest";
import { Splits } from "../../models/splits/splits";
import { TimeShift } from "../../models/time-shift/time-shift";
import { filterDefinitionConverter } from "../version-4/filter-definition";
import { highlightConverter } from "../version-4/highlight-definition";
import { legendConverter } from "../version-4/legend-definition";
import { splitConverter } from "../version-4/split-definition";
import { ViewDefinitionConverter } from "../view-definition-converter";
import { seriesDefinitionConverter } from "./measures-definition";
import { ViewDefinition3 } from "./view-definition-3";

export class ViewDefinitionConverter3 implements ViewDefinitionConverter<ViewDefinition3, Essence> {
  version = 3;

  fromViewDefinition(definition: ViewDefinition3, dataCube: DataCube, visualizations: Manifest[]): Essence {
    const timezone = Timezone.fromJS(definition.timezone);

    const visualizationName = definition.visualization;
    const visualization = NamedArray.findByName(visualizations, visualizationName);
    const timeShift = definition.timeShift ? TimeShift.fromJS(definition.timeShift) : TimeShift.empty();

    const filter = Filter.fromClauses(definition.filters.map(fc => filterDefinitionConverter.toFilterClause(fc, dataCube)));

    const splitDefinitions = List(definition.splits);
    const splits = new Splits({ splits: splitDefinitions.map(splitConverter.toSplitCombine) });

    const pinnedDimensions = OrderedSet(definition.pinnedDimensions || []);
    const colors = definition.legend && legendConverter.toColors(definition.legend, dataCube);
    const pinnedSort = definition.pinnedSort;
    const series = seriesDefinitionConverter.toEssenceSeries(definition.measures);
    const highlight = definition.highlight && highlightConverter(dataCube)
      .toHighlight(definition.highlight);

    return new Essence({
      dataCube,
      visualizations,
      visualization,
      timezone,
      filter,
      timeShift,
      splits,
      pinnedDimensions,
      series,
      colors,
      pinnedSort,
      compare: null,
      highlight
    });
  }

  toViewDefinition(essence: Essence): ViewDefinition3 {
    throw new Error("toViewDefinition is not supported in Version 3");
  }
}
