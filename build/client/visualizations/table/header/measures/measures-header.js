"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var concrete_series_1 = require("../../../../../common/models/series/concrete-series");
var sort_1 = require("../../../../../common/models/sort/sort");
var measure_header_cell_1 = require("./measure-header-cell");
function sortDirection(commonSort, series, period) {
    if (period === void 0) { period = concrete_series_1.SeriesDerivation.CURRENT; }
    var isSortedBy = commonSort instanceof sort_1.SeriesSort && commonSort.reference === series.definition.key() && commonSort.period === period;
    return isSortedBy ? commonSort.direction : null;
}
exports.MeasuresHeader = function (props) {
    var cellWidth = props.cellWidth, series = props.series, commonSort = props.commonSort, showPrevious = props.showPrevious;
    return React.createElement(React.Fragment, null, series.map(function (serie) {
        var currentMeasure = React.createElement(measure_header_cell_1.MeasureHeaderCell, { key: serie.reactKey(), width: cellWidth, title: serie.title(), sort: sortDirection(commonSort, serie) });
        if (!showPrevious) {
            return currentMeasure;
        }
        return React.createElement(React.Fragment, null,
            currentMeasure,
            React.createElement(measure_header_cell_1.MeasureHeaderCell, { key: serie.reactKey(concrete_series_1.SeriesDerivation.PREVIOUS), width: cellWidth, title: serie.title(concrete_series_1.SeriesDerivation.PREVIOUS), sort: sortDirection(commonSort, serie, concrete_series_1.SeriesDerivation.PREVIOUS) }),
            React.createElement(measure_header_cell_1.MeasureHeaderCell, { className: "measure-delta", key: serie.reactKey(concrete_series_1.SeriesDerivation.DELTA), width: cellWidth, title: "Difference", sort: sortDirection(commonSort, serie, concrete_series_1.SeriesDerivation.DELTA) }));
    }));
};
//# sourceMappingURL=measures-header.js.map