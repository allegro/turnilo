import { BAR_TITLE_WIDTH, CORE_ITEM_WIDTH, CORE_ITEM_GAP, VIS_SELECTOR_WIDTH, OVERFLOW_WIDTH } from '../../config/constants';

export const SECTION_WIDTH = CORE_ITEM_WIDTH + CORE_ITEM_GAP;

function getWidthNoOverflowAdjustment(stageWidth: number) {
  return stageWidth - BAR_TITLE_WIDTH - VIS_SELECTOR_WIDTH + CORE_ITEM_GAP;
}

export function getMaxItems(stageWidth: number, itemsLength: number): number {
  var maxWidth = getWidthNoOverflowAdjustment(stageWidth);
  var includedItems = itemsLength;
  var initialMax = Math.floor((maxWidth - OVERFLOW_WIDTH ) / SECTION_WIDTH);

  if (initialMax < includedItems) {

    var widthPlusOverflow = initialMax * SECTION_WIDTH + OVERFLOW_WIDTH + CORE_ITEM_GAP;
    var maxItems: number = null;

    if (maxWidth < widthPlusOverflow) {
      maxItems = initialMax - 1;
    } else if (includedItems - initialMax === 1) {
      maxItems = Math.floor(maxWidth / SECTION_WIDTH);
    } else {
      maxItems = initialMax;
    }
    return maxItems;
  } else {
    return initialMax;
  }
}
