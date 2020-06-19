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
var defaultPercentOf = {
    operation: null
};
var PercentExpression = (function (_super) {
    __extends(PercentExpression, _super);
    function PercentExpression(params) {
        return _super.call(this, params) || this;
    }
    PercentExpression.prototype.key = function () {
        return this.operation;
    };
    PercentExpression.prototype.toConcreteExpression = function (_measures) {
        return new ConcretePercentExpression(this.operation);
    };
    return PercentExpression;
}(immutable_1.Record(defaultPercentOf)));
exports.PercentExpression = PercentExpression;
var ConcretePercentExpression = (function () {
    function ConcretePercentExpression(operation) {
        this.operation = operation;
    }
    ConcretePercentExpression.prototype.relativeNesting = function (nestingLevel) {
        switch (this.operation) {
            case expression_1.ExpressionSeriesOperation.PERCENT_OF_TOTAL:
                return nestingLevel;
            case expression_1.ExpressionSeriesOperation.PERCENT_OF_PARENT:
                return Math.min(nestingLevel, 1);
        }
    };
    ConcretePercentExpression.prototype.toExpression = function (expression, name, nestingLevel) {
        var relativeNesting = this.relativeNesting(nestingLevel);
        var formulaName = "__formula_" + name;
        if (relativeNesting < 0)
            throw new Error("wrong nesting level: " + relativeNesting);
        return new plywood_1.ApplyExpression({
            name: name,
            operand: new plywood_1.ApplyExpression({ expression: expression, name: formulaName }),
            expression: plywood_1.$(formulaName).divide(plywood_1.$(formulaName, relativeNesting)).fallback(0)
        });
    };
    ConcretePercentExpression.prototype.title = function () {
        switch (this.operation) {
            case expression_1.ExpressionSeriesOperation.PERCENT_OF_PARENT:
                return "(% of Parent)";
            case expression_1.ExpressionSeriesOperation.PERCENT_OF_TOTAL:
                return "(% of Total)";
        }
    };
    return ConcretePercentExpression;
}());
exports.ConcretePercentExpression = ConcretePercentExpression;
//# sourceMappingURL=percent.js.map