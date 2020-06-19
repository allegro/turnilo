"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_1 = require("immutable");
var immutable_class_1 = require("immutable-class");
var general_1 = require("../../utils/general/general");
var dimension_group_1 = require("./dimension-group");
var FlattenDimensionsWithGroupsVisitor = (function () {
    function FlattenDimensionsWithGroupsVisitor() {
        this.items = immutable_1.List().asMutable();
    }
    FlattenDimensionsWithGroupsVisitor.prototype.visitDimension = function (dimension) {
        this.items.push(dimension);
    };
    FlattenDimensionsWithGroupsVisitor.prototype.visitDimensionGroup = function (dimensionGroup) {
        var _this = this;
        this.items.push(dimensionGroup);
        dimensionGroup.dimensions.forEach(function (dimensionOrGroup) { return dimensionOrGroup.accept(_this); });
    };
    FlattenDimensionsWithGroupsVisitor.prototype.getDimensionsWithGroups = function () {
        return this.items.toList();
    };
    return FlattenDimensionsWithGroupsVisitor;
}());
function findDuplicateNames(items) {
    return items
        .groupBy(function (dimension) { return dimension.name; })
        .filter(function (names) { return names.count() > 1; })
        .map(function (names, name) { return name; })
        .toList();
}
function filterDimensions(items) {
    return items.filter(function (item) { return item.type === "dimension"; });
}
var Dimensions = (function () {
    function Dimensions(dimensions) {
        this.dimensions = dimensions.slice();
        var flattenDimensionsWithGroupsVisitor = new FlattenDimensionsWithGroupsVisitor();
        this.dimensions.forEach(function (dimensionOrGroup) { return dimensionOrGroup.accept(flattenDimensionsWithGroupsVisitor); });
        var flattenedDimensionsWithGroups = flattenDimensionsWithGroupsVisitor.getDimensionsWithGroups();
        var duplicateNames = findDuplicateNames(flattenedDimensionsWithGroups);
        if (duplicateNames.size > 0) {
            throw new Error("found duplicate dimension or group with names: " + general_1.quoteNames(duplicateNames));
        }
        this.flattenedDimensions = filterDimensions(flattenedDimensionsWithGroups);
    }
    Dimensions.empty = function () {
        return new Dimensions([]);
    };
    Dimensions.fromJS = function (parameters) {
        return new Dimensions(parameters.map(dimension_group_1.dimensionOrGroupFromJS));
    };
    Dimensions.fromDimensions = function (dimensions) {
        return new Dimensions(dimensions);
    };
    Dimensions.prototype.accept = function (visitor) {
        return this.dimensions.map(function (dimensionOrGroup) { return dimensionOrGroup.accept(visitor); });
    };
    Dimensions.prototype.size = function () {
        return this.flattenedDimensions.size;
    };
    Dimensions.prototype.first = function () {
        return this.flattenedDimensions.first();
    };
    Dimensions.prototype.equals = function (other) {
        return this === other || immutable_class_1.immutableArraysEqual(this.dimensions, other.dimensions);
    };
    Dimensions.prototype.mapDimensions = function (mapper) {
        return this.flattenedDimensions.map(mapper).toArray();
    };
    Dimensions.prototype.filterDimensions = function (predicate) {
        return this.flattenedDimensions.filter(predicate).toArray();
    };
    Dimensions.prototype.forEachDimension = function (sideEffect) {
        this.flattenedDimensions.forEach(sideEffect);
    };
    Dimensions.prototype.getDimensionByName = function (name) {
        return this.flattenedDimensions.find(function (dimension) { return dimension.name === name; });
    };
    Dimensions.prototype.getDimensionByExpression = function (expression) {
        return this.flattenedDimensions.find(function (dimension) { return expression.equals(dimension.expression); });
    };
    Dimensions.prototype.getDimensionNames = function () {
        return this.flattenedDimensions.map(function (dimension) { return dimension.name; }).toList();
    };
    Dimensions.prototype.containsDimensionWithName = function (name) {
        return this.flattenedDimensions.some(function (dimension) { return dimension.name === name; });
    };
    Dimensions.prototype.append = function () {
        var dimensions = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            dimensions[_i] = arguments[_i];
        }
        return new Dimensions(this.dimensions.concat(dimensions));
    };
    Dimensions.prototype.prepend = function () {
        var dimensions = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            dimensions[_i] = arguments[_i];
        }
        return new Dimensions(dimensions.concat(this.dimensions));
    };
    Dimensions.prototype.toJS = function () {
        return this.dimensions.map(function (dimensionOrGroup) { return dimensionOrGroup.toJS(); });
    };
    return Dimensions;
}());
exports.Dimensions = Dimensions;
//# sourceMappingURL=dimensions.js.map