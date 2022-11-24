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
import { manifestByName } from "../../visualization-manifests";
import { filterDefinitionConverter } from "../version-4/filter-definition";
import { splitConverter } from "../version-4/split-definition";
import { ViewDefinitionConverter } from "../view-definition-converter";
import { seriesDefinitionConverter } from "./measures-definition";
import { ViewDefinition3 } from "./view-definition-3";

export class ViewDefinitionConverter3 implements ViewDefinitionConverter<ViewDefinition3, Essence> {
  version = 3;

  fromViewDefinition(definition: ViewDefinition3, appSettings: ClientAppSettings, dataCube: ClientDataCube): Essence {
    const timezone = Timezone.fromJS(definition.timezone);

    const visualization = manifestByName(definition.visualization);
    const visualizationSettings = visualization.visualizationSettings.defaults;
    const timeShift = definition.timeShift ? TimeShift.fromJS(definition.timeShift) : TimeShift.empty();

    const filter = Filter.fromClauses(definition.filters.map(fc => filterDefinitionConverter.toFilterClause(fc, dataCube)));

    const splitDefinitions = List(definition.splits);
    const splits = new Splits({ splits: splitDefinitions.map(sd => splitConverter.toSplitCombine(sd, dataCube)) });

    const pinnedDimensions = OrderedSet(definition.pinnedDimensions || []);
    const pinnedSort = definition.pinnedSort;
    const series = seriesDefinitionConverter.toEssenceSeries(definition.measures, dataCube.measures);

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

  toViewDefinition(essence: Essence): ViewDefinition3 {
    throw new Error("toViewDefinition is not supported in Version 3");
  }
}
