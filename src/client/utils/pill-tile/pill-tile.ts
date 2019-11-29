/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { ADD_TILE_WIDTH, BAR_TITLE_WIDTH, CORE_ITEM_GAP, CORE_ITEM_WIDTH, OVERFLOW_WIDTH, PANEL_TOGGLE_WIDTH, VIS_SELECTOR_WIDTH } from "../../config/constants";

export const SECTION_WIDTH = CORE_ITEM_WIDTH + CORE_ITEM_GAP;

function getWidthNoOverflowAdjustment(stageWidth: number) {
  return stageWidth - (2 * PANEL_TOGGLE_WIDTH) - BAR_TITLE_WIDTH - ADD_TILE_WIDTH - VIS_SELECTOR_WIDTH + CORE_ITEM_GAP;
}

export function getMaxItems(stageWidth: number, itemsLength: number): number {
  const maxWidth = getWidthNoOverflowAdjustment(stageWidth);
  const includedItems = itemsLength;
  const initialMax = Math.floor((maxWidth - OVERFLOW_WIDTH) / SECTION_WIDTH);

  if (initialMax < includedItems) {
    const widthPlusOverflow = initialMax * SECTION_WIDTH + OVERFLOW_WIDTH + CORE_ITEM_GAP;
    if (maxWidth < widthPlusOverflow) {
      return initialMax - 1;
    }
    if (includedItems - initialMax === 1) {
      return Math.floor(maxWidth / SECTION_WIDTH);
    }
  }
  return initialMax;
}
