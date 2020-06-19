"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var table_1 = require("../table");
function visibleIndexRange(rowCount, height, scrollTopOffset) {
    return [
        Math.max(0, Math.floor(scrollTopOffset / table_1.ROW_HEIGHT)),
        Math.min(rowCount, Math.ceil((scrollTopOffset + height) / table_1.ROW_HEIGHT))
    ];
}
exports.visibleIndexRange = visibleIndexRange;
//# sourceMappingURL=visible-index-range.js.map