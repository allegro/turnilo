"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var concrete_series_1 = require("../../../../common/models/series/concrete-series");
var general_1 = require("../../../../common/utils/general/general");
var table_1 = require("../table");
function indexToPeriod(index) {
    return [concrete_series_1.SeriesDerivation.CURRENT, concrete_series_1.SeriesDerivation.PREVIOUS, concrete_series_1.SeriesDerivation.DELTA][index % 3];
}
var HoverElement;
(function (HoverElement) {
    HoverElement[HoverElement["CORNER"] = 0] = "CORNER";
    HoverElement[HoverElement["ROW"] = 1] = "ROW";
    HoverElement[HoverElement["HEADER"] = 2] = "HEADER";
    HoverElement[HoverElement["WHITESPACE"] = 3] = "WHITESPACE";
})(HoverElement = exports.HoverElement || (exports.HoverElement = {}));
function seriesPosition(x, essence, segmentWidth, columnWidth) {
    var seriesList = essence.series.series;
    var xOffset = x - segmentWidth;
    var seriesIndex = Math.floor(xOffset / columnWidth);
    if (essence.hasComparison()) {
        var nominalIndex = general_1.integerDivision(seriesIndex, 3);
        var series_1 = seriesList.get(nominalIndex);
        if (!series_1)
            return { element: HoverElement.WHITESPACE };
        var period = indexToPeriod(seriesIndex);
        return { element: HoverElement.HEADER, series: series_1, period: period };
    }
    var series = seriesList.get(seriesIndex);
    if (!series)
        return { element: HoverElement.WHITESPACE };
    return { element: HoverElement.HEADER, series: series, period: concrete_series_1.SeriesDerivation.CURRENT };
}
exports.seriesPosition = seriesPosition;
function rowPosition(y, data) {
    var yOffset = y - table_1.HEADER_HEIGHT;
    var rowIndex = Math.floor(yOffset / table_1.ROW_HEIGHT);
    var datum = data ? data[rowIndex] : null;
    if (!datum)
        return { element: HoverElement.WHITESPACE };
    return { element: HoverElement.ROW, datum: datum };
}
exports.rowPosition = rowPosition;
//# sourceMappingURL=calculate-hover-position.js.map