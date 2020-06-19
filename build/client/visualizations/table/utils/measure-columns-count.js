"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function measureColumnsCount(essence) {
    var seriesCount = essence.series.series.count();
    return essence.hasComparison() ? seriesCount * 3 : seriesCount;
}
exports.measureColumnsCount = measureColumnsCount;
//# sourceMappingURL=measure-columns-count.js.map