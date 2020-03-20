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

import { Dimension } from "../../../../common/models/dimension/dimension";
import { Essence } from "../../../../common/models/essence/essence";
import { SortOn } from "../../../../common/models/sort-on/sort-on";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";

export interface QueryParams {
  essence: Essence;
  searchText: string;
  sortOn: SortOn;
  timekeeper: Timekeeper;
  dimension: Dimension;
}

export function equalParams(params: QueryParams, otherParams: Partial<QueryParams>): boolean {
  const { essence, searchText, sortOn, dimension, timekeeper } = params;
  const { essence: otherEssence, searchText: otherSearchText, sortOn: otherSortOn, dimension: otherDimension, timekeeper: otherTimekeeper } = otherParams;
  return essence.equals(otherEssence) &&
    searchText === otherSearchText &&
    timekeeper === otherTimekeeper &&
    dimension === otherDimension &&
    sortOn.equals(otherSortOn);
}
