"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var concreteArithmeticOperation_1 = require("./concreteArithmeticOperation");
var percent_1 = require("./percent");
var ExpressionSeriesOperation;
(function (ExpressionSeriesOperation) {
    ExpressionSeriesOperation["PERCENT_OF_PARENT"] = "percent_of_parent";
    ExpressionSeriesOperation["PERCENT_OF_TOTAL"] = "percent_of_total";
    ExpressionSeriesOperation["SUBTRACT"] = "subtract";
    ExpressionSeriesOperation["ADD"] = "add";
    ExpressionSeriesOperation["MULTIPLY"] = "multiply";
    ExpressionSeriesOperation["DIVIDE"] = "divide";
})(ExpressionSeriesOperation = exports.ExpressionSeriesOperation || (exports.ExpressionSeriesOperation = {}));
function fromJS(params) {
    var operation = params.operation;
    switch (operation) {
        case ExpressionSeriesOperation.PERCENT_OF_TOTAL:
        case ExpressionSeriesOperation.PERCENT_OF_PARENT:
            return new percent_1.PercentExpression({ operation: operation });
        case ExpressionSeriesOperation.SUBTRACT:
        case ExpressionSeriesOperation.ADD:
        case ExpressionSeriesOperation.MULTIPLY:
        case ExpressionSeriesOperation.DIVIDE:
            var reference = params.reference;
            return new concreteArithmeticOperation_1.ArithmeticExpression({ operation: operation, reference: reference });
    }
}
exports.fromJS = fromJS;
//# sourceMappingURL=expression.js.map