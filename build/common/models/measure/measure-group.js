"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_class_1 = require("immutable-class");
var general_1 = require("../../utils/general/general");
var measure_1 = require("./measure");
function measureOrGroupFromJS(measureOrGroup) {
    if (isMeasureGroupJS(measureOrGroup)) {
        return MeasureGroup.fromJS(measureOrGroup);
    }
    else {
        return measure_1.Measure.fromJS(measureOrGroup);
    }
}
exports.measureOrGroupFromJS = measureOrGroupFromJS;
function isMeasureGroupJS(measureOrGroupJS) {
    return measureOrGroupJS.measures !== undefined;
}
exports.isMeasureGroupJS = isMeasureGroupJS;
var MeasureGroup = (function () {
    function MeasureGroup(parameters) {
        this.type = "group";
        this.name = parameters.name;
        this.title = parameters.title || general_1.makeTitle(parameters.name);
        this.description = parameters.description;
        this.measures = parameters.measures;
    }
    MeasureGroup.fromJS = function (parameters) {
        var name = parameters.name, title = parameters.title, description = parameters.description, measures = parameters.measures;
        if (name == null) {
            throw new Error("measure group requires a name");
        }
        if (measures == null || measures.length === 0) {
            throw new Error("measure group '" + name + "' has no measures");
        }
        return new MeasureGroup({
            name: name,
            title: title,
            description: description,
            measures: measures.map(measureOrGroupFromJS)
        });
    };
    MeasureGroup.isMeasureGroup = function (candidate) {
        return candidate instanceof MeasureGroup;
    };
    MeasureGroup.prototype.accept = function (visitor) {
        return visitor.visitMeasureGroup(this);
    };
    MeasureGroup.prototype.equals = function (other) {
        return this === other
            || MeasureGroup.isMeasureGroup(other) && immutable_class_1.immutableArraysEqual(this.measures, other.measures);
    };
    MeasureGroup.prototype.toJS = function () {
        var measureGroup = {
            name: this.name,
            measures: this.measures.map(function (measure) { return measure.toJS(); }),
            title: this.title
        };
        if (this.description)
            measureGroup.description = this.description;
        return measureGroup;
    };
    MeasureGroup.prototype.toJSON = function () {
        return this.toJS();
    };
    MeasureGroup.prototype.valueOf = function () {
        var measureGroup = {
            name: this.name,
            title: this.title,
            measures: this.measures
        };
        if (this.description)
            measureGroup.description = this.description;
        return measureGroup;
    };
    return MeasureGroup;
}());
exports.MeasureGroup = MeasureGroup;
//# sourceMappingURL=measure-group.js.map