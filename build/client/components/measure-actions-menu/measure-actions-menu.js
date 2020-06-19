"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var stage_1 = require("../../../common/models/stage/stage");
var bubble_menu_1 = require("../bubble-menu/bubble-menu");
var add_arithmetic_operation_1 = require("./add-arithmetic-operation");
var add_measure_series_1 = require("./add-measure-series");
var add_percent_series_1 = require("./add-percent-series");
var add_quantile_series_1 = require("./add-quantile-series");
require("./measure-actions-menu.scss");
var ACTION_HEIGHT = 50;
var ACTION_WIDTH = 58;
var MENU_PADDING = 16;
exports.MeasureActionsMenu = function (props) {
    var direction = props.direction, containerStage = props.containerStage, openOn = props.openOn, measure = props.measure, onClose = props.onClose;
    if (!measure)
        return null;
    var actions = measureActions(props);
    return React.createElement(bubble_menu_1.BubbleMenu, { className: "measure-actions-menu", direction: direction, containerStage: containerStage, stage: stage_1.Stage.fromSize(MENU_PADDING + ACTION_WIDTH * actions.length, ACTION_HEIGHT + MENU_PADDING), fixedSize: true, openOn: openOn, onClose: onClose }, actions);
};
function measureActions(props) {
    var series = props.series, measure = props.measure, onClose = props.onClose, addSeries = props.addSeries, appendDirtySeries = props.appendDirtySeries;
    if (measure.isQuantile()) {
        return [
            React.createElement(add_quantile_series_1.AddQuantileSeriesButton, { key: "Add", addSeries: addSeries, appendDirtySeries: appendDirtySeries, measure: measure, series: series, onClose: onClose })
        ];
    }
    if (measure.isApproximate()) {
        return [
            React.createElement(add_measure_series_1.AddMeasureSeriesButton, { key: "Add", addSeries: addSeries, series: series, measure: measure, onClose: onClose })
        ];
    }
    return [
        React.createElement(add_measure_series_1.AddMeasureSeriesButton, { key: "Add", addSeries: addSeries, series: series, measure: measure, onClose: onClose }),
        React.createElement(add_percent_series_1.AddPercentSeriesButton, { key: "Percent", addSeries: addSeries, measure: measure, onClose: onClose, series: series }),
        React.createElement(add_arithmetic_operation_1.AddArithmeticOperationButton, { key: "Arithmetic", addExpressionPlaceholder: appendDirtySeries, measure: measure, onClose: onClose })
    ];
}
//# sourceMappingURL=measure-actions-menu.js.map