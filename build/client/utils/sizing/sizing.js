"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getVisibleSegments(segmentWidths, offset, visibleSize) {
    var startIndex = 0;
    var shownColumns = 0;
    var curWidth = 0;
    for (var _i = 0, segmentWidths_1 = segmentWidths; _i < segmentWidths_1.length; _i++) {
        var segmentWidth = segmentWidths_1[_i];
        var afterWidth = curWidth + segmentWidth;
        if (afterWidth < offset) {
            startIndex++;
        }
        else if (curWidth < offset + visibleSize) {
            shownColumns++;
        }
        curWidth = afterWidth;
    }
    return {
        startIndex: startIndex,
        shownColumns: shownColumns
    };
}
exports.getVisibleSegments = getVisibleSegments;
//# sourceMappingURL=sizing.js.map