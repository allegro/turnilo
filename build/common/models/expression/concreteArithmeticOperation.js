"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_1 = require("immutable");
var plywood_1 = require("plywood");
var expression_1 = require("./expression");
var defaultExpression = {
    operation: null,
    reference: null
};
var ArithmeticExpression = (function (_super) {
    __extends(ArithmeticExpression, _super);
    function ArithmeticExpression(params) {
        return _super.call(this, params) || this;
    }
    ArithmeticExpression.prototype.key = function () {
        return this.operation + "__" + this.reference;
    };
    ArithmeticExpression.prototype.toConcreteExpression = function (measures) {
        return new ConcreteArithmeticOperation(this.operation, measures.getMeasureByName(this.reference));
    };
    return ArithmeticExpression;
}(immutable_1.Record(defaultExpression)));
exports.ArithmeticExpression = ArithmeticExpression;
var ConcreteArithmeticOperation = (function () {
    function ConcreteArithmeticOperation(operation, measure) {
        this.operation = operation;
        this.measure = measure;
    }
    ConcreteArithmeticOperation.prototype.operationName = function () {
        switch (this.operation) {
            case expression_1.ExpressionSeriesOperation.SUBTRACT:
                return "minus";
            case expression_1.ExpressionSeriesOperation.MULTIPLY:
                return "times";
            case expression_1.ExpressionSeriesOperation.DIVIDE:
                return "by";
            case expression_1.ExpressionSeriesOperation.ADD:
                return "plus";
        }
    };
    ConcreteArithmeticOperation.prototype.title = function () {
        return " " + this.operationName() + " " + this.measure.title;
    };
    ConcreteArithmeticOperation.prototype.calculate = function (a) {
        var operand = this.measure.expression;
        switch (this.operation) {
            case expression_1.ExpressionSeriesOperation.SUBTRACT:
                return a.subtract(operand);
            case expression_1.ExpressionSeriesOperation.MULTIPLY:
                return a.multiply(operand);
            case expression_1.ExpressionSeriesOperation.DIVIDE:
                return a.divide(operand);
            case expression_1.ExpressionSeriesOperation.ADD:
                return a.add(operand);
        }
    };
    ConcreteArithmeticOperation.prototype.toExpression = function (expression, name, _nestingLevel) {
        return new plywood_1.ApplyExpression({
            name: name,
            expression: this.calculate(expression)
        });
    };
    return ConcreteArithmeticOperation;
}());
exports.ConcreteArithmeticOperation = ConcreteArithmeticOperation;
//# sourceMappingURL=concreteArithmeticOperation.js.map