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
import { ClientAppSettings } from "../../models/app-settings/app-settings";
import { ClientDataCube } from "../../models/data-cube/data-cube";
import { Essence } from "../../models/essence/essence";
import { Filter } from "../../models/filter/filter";
import { Splits } from "../../models/splits/splits";
import { TimeShift } from "../../models/time-shift/time-shift";
import { isTruthy } from "../../utils/general/general";
import { manifestByName } from "../../visualization-manifests";
import { ViewDefinitionConverter } from "../view-definition-converter";
import { filterDefinitionConverter } from "./filter-definition";
import { seriesDefinitionConverter } from "./series-definition";
import { splitConverter } from "./split-definition";
import { ViewDefinition4 } from "./view-definition-4";
import { fromViewDefinition, toViewDefinition } from "./visualization-settings-converter";

export class ViewDefinitionConverter4 implements ViewDefinitionConverter<ViewDefinition4, Essence> {
  version = 4;

  fromViewDefinition(definition: ViewDefinition4, appSettings: ClientAppSettings, dataCube: ClientDataCube): Essence {
    const timezone = Timezone.fromJS(definition.timezone);

    const visualization = manifestByName(definition.visualization);
    const visualizationSettings = fromViewDefinition(visualization, definition.visualizationSettings);
    const timeShift = definition.timeShift ? TimeShift.fromJS(definition.timeShift) : TimeShift.empty();

    const clauses = definition.filters
      .map(fc => {
        try {
          return filterDefinitionConverter.toFilterClause(fc, dataCube);
        } catch (e) {
          return null;
        }
      })
      .filter(isTruthy);

    const filter = Filter.fromClauses(clauses);

    const splitDefinitions = definition.splits
      .map(sd => {
        try {
          return splitConverter.toSplitCombine(sd, dataCube);
        } catch (e) {
          return null;
        }
      })
      .filter(isTruthy);

    const splits = new Splits({ splits: List(splitDefinitions) });

    const pinnedDimensions = OrderedSet(definition.pinnedDimensions || []);
    const pinnedSort = definition.pinnedSort;
    const series = seriesDefinitionConverter.toEssenceSeries(definition.series, dataCube.measures);

    return new Essence({
      appSettings,
      dataCube,
      visualization,
      visualizationSettings,
      timezone,
      filter,
      timeShift,
      splits,
      pinnedDimensions,
      series,
      pinnedSort
    });
  }

  toViewDefinition(essence: Essence): ViewDefinition4 {
    return {
      visualization: essence.visualization.name,
      visualizationSettings: toViewDefinition(essence.visualization, essence.visualizationSettings),
      timezone: essence.timezone.toJS(),
      filters: essence.filter.clauses.map(fc => filterDefinitionConverter.fromFilterClause(fc)).toArray(),
      splits: essence.splits.splits.map(splitConverter.fromSplitCombine).toArray(),
      series: seriesDefinitionConverter.fromEssenceSeries(essence.series),
      pinnedDimensions: essence.pinnedDimensions.toArray(),
      pinnedSort: essence.pinnedSort,
      timeShift: essence.hasComparison() ? essence.timeShift.toJS() : undefined
    };
  }
}
