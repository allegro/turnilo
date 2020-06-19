"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var concreteArithmeticOperation_1 = require("../../../common/models/expression/concreteArithmeticOperation");
var expression_1 = require("../../../common/models/expression/expression");
var expression_series_1 = require("../../../common/models/series/expression-series");
var dom_1 = require("../../utils/dom/dom");
var svg_icon_1 = require("../svg-icon/svg-icon");
exports.AddArithmeticOperationButton = function (props) {
    var measure = props.measure, addExpressionPlaceholder = props.addExpressionPlaceholder, onClose = props.onClose;
    function onNewOperation() {
        addExpressionPlaceholder(new expression_series_1.ExpressionSeries({
            reference: measure.name,
            expression: new concreteArithmeticOperation_1.ArithmeticExpression({
                operation: expression_1.ExpressionSeriesOperation.ADD,
                reference: null
            })
        }));
        onClose();
    }
    return React.createElement("div", { className: dom_1.classNames("new-arithmetic-expression", "action"), onClick: onNewOperation },
        React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/full-arithmetic.svg") }),
        React.createElement("div", { className: "action-label" }, "Calculate"));
};
//# sourceMappingURL=add-arithmetic-operation.js.map