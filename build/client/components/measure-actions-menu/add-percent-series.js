"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_1 = require("immutable");
var React = require("react");
var expression_1 = require("../../../common/models/expression/expression");
var percent_1 = require("../../../common/models/expression/percent");
var expression_series_1 = require("../../../common/models/series/expression-series");
var series_format_1 = require("../../../common/models/series/series-format");
var dom_1 = require("../../utils/dom/dom");
var svg_icon_1 = require("../svg-icon/svg-icon");
var percentOperations = immutable_1.Set.of(expression_1.ExpressionSeriesOperation.PERCENT_OF_PARENT, expression_1.ExpressionSeriesOperation.PERCENT_OF_TOTAL);
exports.AddPercentSeriesButton = function (props) {
    var series = props.series, measure = props.measure, addSeries = props.addSeries, onClose = props.onClose;
    var percentSeries = series
        .getExpressionSeriesFor(measure.name)
        .filter(function (s) { return s.expression instanceof percent_1.PercentExpression; })
        .map(function (s) { return s.expression.operation; })
        .toSet();
    var percentsDisabled = percentSeries.count() === 2;
    function onNewPercentExpression() {
        if (!percentsDisabled) {
            var operation = percentOperations.subtract(percentSeries).first();
            addSeries(new expression_series_1.ExpressionSeries({
                reference: measure.name,
                format: series_format_1.PERCENT_FORMAT,
                expression: new percent_1.PercentExpression({ operation: operation })
            }));
        }
        onClose();
    }
    return React.createElement("div", { className: dom_1.classNames("new-percent-expression", "action", { disabled: percentsDisabled }), onClick: onNewPercentExpression },
        React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/full-percent.svg") }),
        React.createElement("div", { className: "action-label" }, "Percent"));
};
//# sourceMappingURL=add-percent-series.js.map