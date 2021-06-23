/*
 * Copyright 2017-2021 Allegro.pl
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
import { PseudoDatum } from "plywood";
import { Essence } from "../../../../common/models/essence/essence";
import { Highlight } from "../../highlight-controller/highlight";
import { getFilterFromDatum } from "./filter-for-datum";

export function getRowIndexForHighlight(essence: Essence, highlight: Highlight | null, flatData?: PseudoDatum[]): number | null {
  if (!flatData) return null;
  if (highlight === null) return null;
  const { splits } = essence;
  const index = flatData.findIndex(d => highlight.clauses.equals(getFilterFromDatum(splits, d)));
  if (index >= 0) return index;
  return null;
}
