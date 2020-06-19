"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var visualization_props_1 = require("../../../../common/models/visualization-props/visualization-props");
var constants_1 = require("../../../config/constants");
function tileStyles(datasetLoad) {
    var topOffset = constants_1.PIN_TITLE_HEIGHT + constants_1.PIN_PADDING_BOTTOM;
    var rowsCount = visualization_props_1.isLoaded(datasetLoad) ? datasetLoad.dataset.count() : 0;
    var rowsHeight = Math.max(4, rowsCount) * constants_1.PIN_ITEM_HEIGHT;
    var maxHeight = topOffset + rowsHeight;
    return { maxHeight: maxHeight };
}
exports.tileStyles = tileStyles;
//# sourceMappingURL=tile-styles.js.map