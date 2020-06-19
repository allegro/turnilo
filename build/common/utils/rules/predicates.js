"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Predicates = (function () {
    function Predicates() {
    }
    Predicates.noSplits = function () {
        return function (_a) {
            var splits = _a.splits;
            return splits.length() === 0;
        };
    };
    Predicates.numberOfSplitsIsNot = function (expected) {
        return function (_a) {
            var splits = _a.splits;
            return splits.length() !== expected;
        };
    };
    Predicates.numberOfSeriesIsNot = function (expected) {
        return function (_a) {
            var series = _a.series;
            return series.count() !== expected;
        };
    };
    Predicates.areExactSplitKinds = function () {
        var selectors = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            selectors[_i] = arguments[_i];
        }
        return function (_a) {
            var splits = _a.splits, dataCube = _a.dataCube;
            var kinds = splits.splits.map(function (split) { return dataCube.getDimension(split.reference).kind; }).toArray();
            return Predicates.strictCompare(selectors, kinds);
        };
    };
    Predicates.strictCompare = function (selectors, kinds) {
        if (selectors.length !== kinds.length)
            return false;
        return selectors.every(function (selector, i) { return Predicates.testKind(kinds[i], selector); });
    };
    Predicates.testKind = function (kind, selector) {
        if (selector === "*") {
            return true;
        }
        var bareSelector = selector.replace(/^!/, "");
        var result = kind === bareSelector;
        if (selector.charAt(0) === "!") {
            return !result;
        }
        return result;
    };
    Predicates.haveAtLeastSplitKinds = function () {
        var kinds = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            kinds[_i] = arguments[_i];
        }
        return function (_a) {
            var splits = _a.splits, dataCube = _a.dataCube;
            var getKind = function (split) { return dataCube.getDimension(split.reference).kind; };
            var actualKinds = splits.splits.map(getKind);
            return kinds.every(function (kind) { return actualKinds.indexOf(kind) > -1; });
        };
    };
    Predicates.supportedSplitsCount = function () {
        return function (_a) {
            var splits = _a.splits, dataCube = _a.dataCube;
            return dataCube.getMaxSplits() < splits.length();
        };
    };
    Predicates.noSelectedMeasures = function () {
        return function (_a) {
            var series = _a.series;
            return series.isEmpty();
        };
    };
    return Predicates;
}());
exports.Predicates = Predicates;
//# sourceMappingURL=predicates.js.map