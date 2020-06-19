"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../../config/constants");
exports.SECTION_WIDTH = constants_1.CORE_ITEM_WIDTH + constants_1.CORE_ITEM_GAP;
function getWidthNoOverflowAdjustment(stageWidth) {
    return stageWidth - (2 * constants_1.PANEL_TOGGLE_WIDTH) - constants_1.BAR_TITLE_WIDTH - constants_1.ADD_TILE_WIDTH - constants_1.VIS_SELECTOR_WIDTH + constants_1.CORE_ITEM_GAP;
}
function getMaxItems(stageWidth, itemsLength) {
    var maxWidth = getWidthNoOverflowAdjustment(stageWidth);
    var includedItems = itemsLength;
    var initialMax = Math.floor((maxWidth - constants_1.OVERFLOW_WIDTH) / exports.SECTION_WIDTH);
    if (initialMax < includedItems) {
        var widthPlusOverflow = initialMax * exports.SECTION_WIDTH + constants_1.OVERFLOW_WIDTH + constants_1.CORE_ITEM_GAP;
        if (maxWidth < widthPlusOverflow) {
            return initialMax - 1;
        }
        if (includedItems - initialMax === 1) {
            return Math.floor(maxWidth / exports.SECTION_WIDTH);
        }
    }
    return initialMax;
}
exports.getMaxItems = getMaxItems;
//# sourceMappingURL=pill-tile.js.map