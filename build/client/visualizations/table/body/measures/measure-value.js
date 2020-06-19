"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var concrete_series_1 = require("../../../../../common/models/series/concrete-series");
var delta_1 = require("../../../../components/delta/delta");
var measure_background_1 = require("./measure-background");
var measure_cell_1 = require("./measure-cell");
exports.MeasureValue = function (props) {
    var series = props.series, datum = props.datum, scale = props.scale, highlight = props.highlight, showPrevious = props.showPrevious, cellWidth = props.cellWidth, lastLevel = props.lastLevel;
    var currentValue = series.selectValue(datum);
    var currentCell = React.createElement(measure_cell_1.MeasureCell, { key: series.reactKey(), width: cellWidth, value: series.formatValue(datum) }, lastLevel && React.createElement(measure_background_1.MeasureBackground, { highlight: highlight, width: scale(currentValue) }));
    if (!showPrevious) {
        return currentCell;
    }
    var previousValue = series.selectValue(datum, concrete_series_1.SeriesDerivation.PREVIOUS);
    return React.createElement(React.Fragment, null,
        currentCell,
        React.createElement(measure_cell_1.MeasureCell, { key: series.reactKey(concrete_series_1.SeriesDerivation.PREVIOUS), width: cellWidth, value: series.formatValue(datum, concrete_series_1.SeriesDerivation.PREVIOUS) }, lastLevel && React.createElement(measure_background_1.MeasureBackground, { highlight: highlight, width: scale(previousValue) })),
        React.createElement(measure_cell_1.MeasureCell, { width: cellWidth, key: series.reactKey(concrete_series_1.SeriesDerivation.DELTA), value: React.createElement(delta_1.Delta, { currentValue: currentValue, previousValue: previousValue, lowerIsBetter: series.measure.lowerIsBetter, formatter: series.formatter() }) }));
};
//# sourceMappingURL=measure-value.js.map