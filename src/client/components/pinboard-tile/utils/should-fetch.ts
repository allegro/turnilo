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
import { SortOn } from "../../../../common/models/sort-on/sort-on";
import { PinboardTileProps, PinboardTileState } from "../pinboard-tile";

// TODO: there's mismatch between this method and QueryParams.
//  Of course here we should have more properties (timekeeper, refreshRequestTimestamp)
//  but we should operate on the same source of truth (clause vs searchText)
export function shouldFetchData(
  { essence, timekeeper, dimension, sortOn, refreshRequestTimestamp }: PinboardTileProps,
  previousProps: PinboardTileProps,
  { searchText }: PinboardTileState,
  previousState: PinboardTileState): boolean {
  const previousEssence = previousProps.essence;
  const previousTimekeeper = previousProps.timekeeper;
  const previousDimension = previousProps.dimension;
  const previousSortOn = previousProps.sortOn;
  const previousRefreshRequestTimestamp = previousProps.refreshRequestTimestamp;
  const previousSearchText = previousState.searchText;

  return essence.differentDataCube(previousEssence) ||
    essence.differentEffectiveFilter(previousEssence, timekeeper, previousTimekeeper, dimension) ||
    dimension.name !== previousDimension.name ||
    previousSearchText !== searchText ||
    refreshRequestTimestamp !== previousRefreshRequestTimestamp ||
    !SortOn.equals(sortOn, previousSortOn);
}
