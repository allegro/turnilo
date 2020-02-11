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

import { Timezone } from "chronoshift";
import { List, OrderedSet } from "immutable";
import { NamedArray } from "immutable-class";
import { DataCube } from "../../models/data-cube/data-cube";
import { Essence } from "../../models/essence/essence";
import { Filter } from "../../models/filter/filter";
import { Manifest } from "../../models/manifest/manifest";
import { Splits } from "../../models/splits/splits";
import { TimeShift } from "../../models/time-shift/time-shift";
import { ViewDefinitionConverter } from "../view-definition-converter";
import { filterDefinitionConverter } from "./filter-definition";
import { legendConverter } from "./legend-definition";
import { seriesDefinitionConverter } from "./series-definition";
import { splitConverter } from "./split-definition";
import { ViewDefinition4 } from "./view-definition-4";

export class ViewDefinitionConverter4 implements ViewDefinitionConverter<ViewDefinition4, Essence> {
  version = 4;

  fromViewDefinition(definition: ViewDefinition4, dataCube: DataCube, visualizations: Manifest[]): Essence {
    const timezone = Timezone.fromJS(definition.timezone);

    const visualizationName = definition.visualization;
    const visualization = NamedArray.findByName(visualizations, visualizationName);
    const timeShift = definition.timeShift ? TimeShift.fromJS(definition.timeShift) : TimeShift.empty();

    const filter = Filter.fromClauses(definition.filters.map(fc => filterDefinitionConverter.toFilterClause(fc, dataCube)));

    const splitDefinitions = List(definition.splits);
    const splits = new Splits({ splits: splitDefinitions.map(splitConverter.toSplitCombine) });

    const pinnedDimensions = OrderedSet(definition.pinnedDimensions || []);
    const colors = definition.legend && legendConverter.toColors(definition.legend);
    const pinnedSort = definition.pinnedSort;
    const series = seriesDefinitionConverter.toEssenceSeries(definition.series, dataCube.measures);

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
      pinnedSort
    });
  }

  toViewDefinition(essence: Essence): ViewDefinition4 {
    const { dataCube } = essence;

    return {
      visualization: essence.visualization.name,
      timezone: essence.timezone.toJS(),
      filters: essence.filter.clauses.map(fc => filterDefinitionConverter.fromFilterClause(fc)).toArray(),
      splits: essence.splits.splits.map(splitConverter.fromSplitCombine).toArray(),
      series: seriesDefinitionConverter.fromEssenceSeries(essence.series),
      pinnedDimensions: essence.pinnedDimensions.toArray(),
      pinnedSort: essence.pinnedSort,
      timeShift: essence.hasComparison() ? essence.timeShift.toJS() : undefined,
      legend: essence.colors && legendConverter.fromColors(essence.colors)
    };
  }
}
