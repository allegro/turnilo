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

import { DataCube } from "../../models/data-cube/data-cube";
import { Filter } from "../../models/filter/filter";
import { Highlight } from "../../models/highlight/highlight";
import { FilterClauseDefinition, filterDefinitionConverter } from "./filter-definition";

export interface HighlightDefinition {
  filters: FilterClauseDefinition[];
  measure: string;
}

export interface HighlightDefinitionConverter {
  toHighlight(highlightDefinition: HighlightDefinition): Highlight;

  fromHighlight(highlight: Highlight): HighlightDefinition;
}

export function highlightConverter(dataCube: DataCube): HighlightDefinitionConverter {
  return {
    toHighlight(highlightDefinition: HighlightDefinition): Highlight {
      const { filters, measure } = highlightDefinition;
      const filter = Filter.fromClauses(filters.map(fc => filterDefinitionConverter.toFilterClause(fc, dataCube)));

      return new Highlight({ delta: filter, measure });
    },

    fromHighlight(highlight: Highlight): HighlightDefinition {
      const { delta, measure } = highlight;
      const filters = delta.clauses.map(fc => filterDefinitionConverter.fromFilterClause(fc)).toArray();

      return { filters, measure };
    }
  };
}
