'use strict';

import { $, SortAction } from 'plywood';

export const TITLE_HEIGHT = 36;

// Core = filter + split
export const DIMENSION_HEIGHT = 27;
export const CORE_ITEM_WIDTH = 192;
export const CORE_ITEM_GAP = 8;

export const PIN_TITLE_HEIGHT = 36;
export const SEARCH_BOX_HEIGHT = 30;
export const PIN_ITEM_HEIGHT = 24;
export const PIN_PADDING_BOTTOM = 10;

export const SEGMENT = 'SEGMENT';
export const TIME_SORT_ACTION = new SortAction({
  expression: $(SEGMENT),
  direction: SortAction.ASCENDING
});
