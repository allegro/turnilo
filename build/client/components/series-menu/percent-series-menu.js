"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var expression_1 = require("../../../common/models/expression/expression");
var percent_1 = require("../../../common/models/expression/percent");
var dropdown_1 = require("../dropdown/dropdown");
var format_picker_1 = require("./format-picker");
require("./percent-series-menu.scss");
var OPERATIONS = [{
        id: expression_1.ExpressionSeriesOperation.PERCENT_OF_PARENT, label: "Percent of parent"
    }, {
        id: expression_1.ExpressionSeriesOperation.PERCENT_OF_TOTAL, label: "Percent of total"
    }];
function operationToExpression(operation) {
    return new percent_1.PercentExpression({ operation: operation });
}
var renderOperation = function (op) { return op.label; };
exports.PercentSeriesMenu = function (_a) {
    var series = _a.series, seriesList = _a.seriesList, measure = _a.measure, onChange = _a.onChange;
    var selectedOperations = seriesList
        .getExpressionSeriesFor(measure.name)
        .filter(function (s) { return !s.equals(series); })
        .filter(function (s) { return s.expression instanceof percent_1.PercentExpression; })
        .map(function (s) { return s.expression.operation; })
        .toSet();
    function isSeriesValid(series) {
        return series.expression instanceof percent_1.PercentExpression;
    }
    function onSeriesChange(series) {
        onChange(series, isSeriesValid(series));
    }
    function onFormatChange(format) {
        onSeriesChange(series.set("format", format));
    }
    function onOperationSelect(_a) {
        var id = _a.id;
        onSeriesChange(series.set("expression", operationToExpression(id)));
    }
    return React.createElement(React.Fragment, null,
        React.createElement(dropdown_1.Dropdown, { className: "percent-operation-picker", items: OPERATIONS.filter(function (_a) {
                var id = _a.id;
                return !selectedOperations.has(id);
            }), renderItem: renderOperation, renderSelectedItem: renderOperation, equal: function (a, b) { return a.id === b.id; }, selectedItem: series.expression && OPERATIONS.find(function (op) { return op.id === series.expression.operation; }), onSelect: onOperationSelect }),
        React.createElement(format_picker_1.FormatPicker, { measure: measure, format: series.format, formatChange: onFormatChange }));
};
//# sourceMappingURL=percent-series-menu.js.map