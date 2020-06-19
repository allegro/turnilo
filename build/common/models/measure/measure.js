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
var immutable_class_1 = require("immutable-class");
var plywood_1 = require("plywood");
var general_1 = require("../../utils/general/general");
var some_1 = require("../../utils/plywood/some");
var series_format_1 = require("../series/series-format");
var Measure = (function (_super) {
    __extends(Measure, _super);
    function Measure(parameters) {
        var _this = _super.call(this, parameters) || this;
        _this.type = "measure";
        _this.title = _this.title || general_1.makeTitle(_this.name);
        _this.expression = plywood_1.Expression.parse(_this.formula);
        _this.formatFn = series_format_1.formatFnFactory(_this.getFormat());
        return _this;
    }
    Measure.isMeasure = function (candidate) {
        return candidate instanceof Measure;
    };
    Measure.getMeasure = function (measures, measureName) {
        if (!measureName)
            return null;
        measureName = measureName.toLowerCase();
        return measures.find(function (measure) { return measure.name.toLowerCase() === measureName; });
    };
    Measure.getReferences = function (ex) {
        var references = [];
        ex.forEach(function (sub) {
            if (sub instanceof plywood_1.RefExpression && sub.name !== "main") {
                references = references.concat(sub.name);
            }
        });
        return plywood_1.deduplicateSort(references);
    };
    Measure.hasCountDistinctReferences = function (ex) {
        return some_1.default(ex, function (e) { return e instanceof plywood_1.CountDistinctExpression; });
    };
    Measure.hasQuantileReferences = function (ex) {
        return some_1.default(ex, function (e) { return e instanceof plywood_1.QuantileExpression; });
    };
    Measure.measuresFromAttributeInfo = function (attribute) {
        var name = attribute.name, nativeType = attribute.nativeType;
        var $main = plywood_1.$("main");
        var ref = plywood_1.$(name);
        if (nativeType) {
            if (nativeType === "hyperUnique" || nativeType === "thetaSketch" || nativeType === "HLLSketch") {
                return [
                    new Measure({
                        name: general_1.makeUrlSafeName(name),
                        formula: $main.countDistinct(ref).toString()
                    })
                ];
            }
            else if (nativeType === "approximateHistogram" || nativeType === "quantilesDoublesSketch") {
                return [
                    new Measure({
                        name: general_1.makeUrlSafeName(name + "_p98"),
                        formula: $main.quantile(ref, 0.98).toString()
                    })
                ];
            }
        }
        var expression = $main.sum(ref);
        var makerAction = attribute.maker;
        if (makerAction) {
            switch (makerAction.op) {
                case "min":
                    expression = $main.min(ref);
                    break;
                case "max":
                    expression = $main.max(ref);
                    break;
            }
        }
        return [new Measure({
                name: general_1.makeUrlSafeName(name),
                formula: expression.toString()
            })];
    };
    Measure.fromJS = function (parameters) {
        if (!parameters.formula) {
            var parameterExpression = parameters.expression;
            parameters.formula = (typeof parameterExpression === "string" ? parameterExpression : plywood_1.$("main").sum(plywood_1.$(parameters.name)).toString());
        }
        return new Measure(immutable_class_1.BaseImmutable.jsToValue(Measure.PROPERTIES, parameters));
    };
    Measure.prototype.accept = function (visitor) {
        return visitor.visitMeasure(this);
    };
    Measure.prototype.equals = function (other) {
        return this === other || Measure.isMeasure(other) && _super.prototype.equals.call(this, other);
    };
    Measure.prototype.getTitleWithUnits = function () {
        if (this.units) {
            return this.title + " (" + this.units + ")";
        }
        else {
            return this.title;
        }
    };
    Measure.prototype.isApproximate = function () {
        return Measure.hasCountDistinctReferences(this.expression) || Measure.hasQuantileReferences(this.expression);
    };
    Measure.prototype.isQuantile = function () {
        return this.expression instanceof plywood_1.QuantileExpression;
    };
    Measure.DEFAULT_FORMAT = series_format_1.measureDefaultFormat;
    Measure.DEFAULT_TRANSFORMATION = "none";
    Measure.TRANSFORMATIONS = ["none", "percent-of-parent", "percent-of-total"];
    Measure.PROPERTIES = [
        { name: "name", validate: general_1.verifyUrlSafeName },
        { name: "title", defaultValue: null },
        { name: "units", defaultValue: null },
        { name: "lowerIsBetter", defaultValue: false },
        { name: "formula" },
        { name: "description", defaultValue: undefined },
        { name: "format", defaultValue: Measure.DEFAULT_FORMAT },
        { name: "transformation", defaultValue: Measure.DEFAULT_TRANSFORMATION, possibleValues: Measure.TRANSFORMATIONS }
    ];
    return Measure;
}(immutable_class_1.BaseImmutable));
exports.Measure = Measure;
immutable_class_1.BaseImmutable.finalize(Measure);
//# sourceMappingURL=measure.js.map