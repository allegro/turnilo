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
import { DataCube, Essence, Filter, Manifest } from "../../models";
import { ViewDefinitionConverter } from "../view-definition-converter";
import { filterDefinitionConverter } from "./filter-definition";
import { highlightConverter } from "./highlight-definition";
import { legendConverter } from "./legend-definition";
import { measuresDefinitionConverter } from "./measures-definition";
import { splitConverter } from "./split-definition";
import { ViewDefinition3 } from "./view-definition-3";

export class ViewDefinitionConverter3 implements ViewDefinitionConverter<ViewDefinition3, Essence> {
  version = 3;

  fromViewDefinition(definition: ViewDefinition3, dataCube: DataCube, visualizations: Manifest[]): Essence {
    return Essence.fromJS({
      visualization: definition.visualization,
      timezone: Timezone.fromJS(definition.timezone).toJS(),
      timeShift: definition.timeShift,
      filter: Filter.fromClauses(definition.filters.map(fc => filterDefinitionConverter.toFilterClause(fc, dataCube))).toJS(),
      splits: definition.splits.map(splitConverter.toSplitCombine).map(sc => sc.toJS()),
      multiMeasureMode: measuresDefinitionConverter.toMultiMeasureMode(definition.measures),
      singleMeasure: measuresDefinitionConverter.toSingleMeasure(definition.measures),
      selectedMeasures: measuresDefinitionConverter.toSelectedMeasures(definition.measures).toArray(),
      pinnedDimensions: definition.pinnedDimensions,
      pinnedSort: definition.pinnedSort,
      colors: definition.legend && legendConverter.toColors(definition.legend),
      highlight: definition.highlight && highlightConverter(dataCube).toHighlight(definition.highlight).toJS()
    }, { dataCube, visualizations });
  }

  toViewDefinition(essence: Essence): ViewDefinition3 {
    const { dataCube } = essence;

    return {
      visualization: essence.visualization.name,
      timezone: essence.timezone.toJS(),
      filters: essence.filter.clauses.map(fc => filterDefinitionConverter.fromFilterClause(fc, dataCube)).toArray(),
      splits: essence.splits.splitCombines.map(splitConverter.fromSplitCombine).toArray(),
      measures: measuresDefinitionConverter.fromSimpleValues(essence.multiMeasureMode, essence.singleMeasure, essence.selectedMeasures),
      pinnedDimensions: essence.pinnedDimensions.toArray(),
      pinnedSort: essence.pinnedSort,
      timeShift: essence.hasComparison() ? essence.timeShift.toJS() : undefined,
      legend: essence.colors && legendConverter.fromColors(essence.colors),
      highlight: essence.highlight && highlightConverter(dataCube).fromHighlight(essence.highlight)
    };
  }
}
