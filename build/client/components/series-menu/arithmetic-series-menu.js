"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var concreteArithmeticOperation_1 = require("../../../common/models/expression/concreteArithmeticOperation");
var expression_1 = require("../../../common/models/expression/expression");
var expression_concrete_series_1 = require("../../../common/models/series/expression-concrete-series");
var general_1 = require("../../../common/utils/general/general");
var dropdown_1 = require("../dropdown/dropdown");
require("./arithmetic-series-menu.scss");
var format_picker_1 = require("./format-picker");
var OPERATIONS = [{
        id: expression_1.ExpressionSeriesOperation.ADD, label: "Add"
    }, {
        id: expression_1.ExpressionSeriesOperation.SUBTRACT, label: "Subtract"
    }, {
        id: expression_1.ExpressionSeriesOperation.MULTIPLY, label: "Multiply"
    }, {
        id: expression_1.ExpressionSeriesOperation.DIVIDE, label: "Divide"
    }];
var renderOperation = function (op) { return op.label; };
var renderMeasure = function (m) { return m.title; };
var renderSelectedMeasure = function (m) { return m ? m.title : "Select measure"; };
function expressionSeriesTitle(series, measure, measures) {
    var concreteSeries = new expression_concrete_series_1.ExpressionConcreteSeries(series, measure, measures);
    return concreteSeries.title();
}
exports.ArithmeticSeriesMenu = function (props) {
    var measure = props.measure, measures = props.measures, initialSeries = props.initialSeries, series = props.series, seriesList = props.seriesList, onChange = props.onChange;
    function isSeriesValid(_a) {
        var expression = _a.expression;
        return expression instanceof concreteArithmeticOperation_1.ArithmeticExpression && general_1.isTruthy(expression.reference);
    }
    function onSeriesChange(series) {
        onChange(series, isSeriesValid(series));
    }
    function onFormatChange(format) {
        onSeriesChange(series.set("format", format));
    }
    function onOperationSelect(_a) {
        var id = _a.id;
        onSeriesChange(series.setIn(["expression", "operation"], id));
    }
    function onOperandSelect(_a) {
        var name = _a.name;
        onSeriesChange(series.setIn(["expression", "reference"], name));
    }
    var duplicate = !series.equals(initialSeries) && seriesList.getSeriesWithKey(series.key());
    var expression = series.expression;
    var operation = OPERATIONS.find(function (op) { return op.id === expression.operation; });
    var operand = measures.getMeasureByName(expression.reference);
    return React.createElement(React.Fragment, null,
        React.createElement("div", { className: "operation-select__title" }, "Select operation"),
        React.createElement(dropdown_1.Dropdown, { className: "operation-select", items: OPERATIONS, renderItem: renderOperation, equal: function (a, b) { return a.id === b.id; }, selectedItem: operation, onSelect: onOperationSelect }),
        React.createElement("div", { className: "operand-select__title" }, "Select measure"),
        React.createElement(dropdown_1.Dropdown, { className: "operand-select", items: measures.filterMeasures(function (m) { return !m.equals(measure) && !m.isApproximate(); }), renderItem: renderMeasure, renderSelectedItem: renderSelectedMeasure, equal: function (a, b) { return a.equals(b); }, selectedItem: operand, onSelect: onOperandSelect }),
        duplicate &&
            React.createElement("div", { className: "arithmetic-operation-warning" },
                "\"",
                expressionSeriesTitle(duplicate, measure, measures),
                "\" is already defined"),
        React.createElement(format_picker_1.FormatPicker, { measure: measure, format: series.format, formatChange: onFormatChange }));
};
//# sourceMappingURL=arithmetic-series-menu.js.map