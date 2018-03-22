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

import { Filter, Highlight } from "../../models";
import { FilterClauseDefinition, FilterDefinitionConverter } from "./filter-definition";

export interface HighlightDefinition {
  owner: string;
  filters: FilterClauseDefinition[];
  measure: string;
}

export interface HighlightConversion {
  toHighlight(highlightDefinition: HighlightDefinition): Highlight;

  fromHighlight(highlight: Highlight): HighlightDefinition;
}

export function highlightConverter(filterConverter: FilterDefinitionConverter): HighlightConversion {
  return {
    toHighlight(highlightDefinition: HighlightDefinition): Highlight {
      const { owner, filters, measure } = highlightDefinition;
      const filter = Filter.fromClauses(filters.map(filterConverter.toFilterClause));

      return new Highlight({ owner, delta: filter, measure });
    },
    fromHighlight(highlight: Highlight): HighlightDefinition {
      const { owner, delta, measure } = highlight;
      const filters = delta.clauses.map(filterConverter.fromFilterClause).toArray();

      return { owner, filters, measure };
    }
  };
}
