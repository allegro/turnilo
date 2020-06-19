"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var sort_1 = require("../../../common/models/sort/sort");
var split_1 = require("../../../common/models/split/split");
var formatter_1 = require("../../../common/utils/formatter/formatter");
var constants_1 = require("../../config/constants");
exports.orderByValueDecreasing = function (_a, _b) {
    var _ = _a[0], countA = _a[1];
    var __ = _b[0], countB = _b[1];
    if (countA < countB) {
        return 1;
    }
    if (countA > countB) {
        return -1;
    }
    return 0;
};
exports.orderByValueIncreasing = function (a, b) {
    return -exports.orderByValueDecreasing(a, b);
};
exports.orderByTimeDimensionDecreasing = function (_a, _b) {
    var _ = _a[0], __ = _a[1], originalA = _a[2];
    var ___ = _b[0], ____ = _b[1], originalB = _b[2];
    return -originalA.compare(originalB);
};
exports.orderByTimeDimensionIncreasing = function (_a, _b) {
    var _ = _a[0], __ = _a[1], originalA = _a[2];
    var ___ = _b[0], ____ = _b[1], originalB = _b[2];
    return originalA.compare(originalB);
};
exports.orderByNumberRangeDimensionDecreasing = function (_a, _b) {
    var _ = _a[0], __ = _a[1], originalA = _a[2];
    var ___ = _b[0], ____ = _b[1], originalB = _b[2];
    return -originalA.compare(originalB);
};
exports.orderByNumberRangeDimensionIncreasing = function (_a, _b) {
    var _ = _a[0], __ = _a[1], originalA = _a[2];
    var ___ = _b[0], ____ = _b[1], originalB = _b[2];
    return originalA.compare(originalB);
};
var datumKey = function (dataset, key, timezone) {
    return formatter_1.formatValue(dataset[key], timezone);
};
var splitToFillOrder = function (split) {
    var sort = split.sort;
    switch (split.type) {
        case split_1.SplitType.string:
        default:
            if (sort.direction === sort_1.SortDirection.ascending) {
                return exports.orderByValueIncreasing;
            }
            else {
                return exports.orderByValueDecreasing;
            }
        case split_1.SplitType.time:
            if (sort.direction === sort_1.SortDirection.ascending) {
                return exports.orderByTimeDimensionIncreasing;
            }
            else {
                return exports.orderByTimeDimensionDecreasing;
            }
        case split_1.SplitType.number:
            if (sort.direction === sort_1.SortDirection.ascending) {
                return exports.orderByNumberRangeDimensionIncreasing;
            }
            else {
                return exports.orderByNumberRangeDimensionDecreasing;
            }
    }
};
exports.fillDatasetWithMissingValues = function (dataset, measureName, secondSplit, timezone) {
    var totals = {};
    var identToOriginalKey = {};
    var order = splitToFillOrder(secondSplit);
    var secondSplitName = secondSplit.reference;
    for (var _i = 0, _a = dataset.data; _i < _a.length; _i++) {
        var datum = _a[_i];
        var nestedDataset = datum[constants_1.SPLIT].data;
        for (var _b = 0, nestedDataset_1 = nestedDataset; _b < nestedDataset_1.length; _b++) {
            var nestedDatum = nestedDataset_1[_b];
            var value = nestedDatum[measureName];
            var ident = datumKey(nestedDatum, secondSplitName, timezone);
            if (totals[ident] !== undefined) {
                totals[ident] += value;
            }
            else {
                totals[ident] = value;
                identToOriginalKey[ident] = nestedDatum[secondSplitName];
            }
        }
    }
    var sortedIdents = Object.keys(totals)
        .map(function (ident) { return [ident, totals[ident], identToOriginalKey[ident]]; })
        .sort(order)
        .map(function (_a) {
        var ident = _a[0];
        return ident;
    });
    var newDataset = dataset.data.map(function (datum) {
        var _a;
        var identToNestedDatum = datum[constants_1.SPLIT].data.reduce(function (datumsByIdent, datum) {
            var ident = datumKey(datum, secondSplitName, timezone);
            datumsByIdent[ident] = datum;
            return datumsByIdent;
        }, {});
        var filledNestedDataset = sortedIdents.map(function (ident) {
            var _a, _b;
            var nestedDatum = identToNestedDatum[ident];
            if (nestedDatum) {
                return __assign({}, nestedDatum, (_a = {}, _a[measureName] = Number.isNaN(Number(nestedDatum[measureName])) ? 0 : nestedDatum[measureName], _a));
            }
            else {
                return _b = {},
                    _b[secondSplitName] = identToOriginalKey[ident],
                    _b[measureName] = 0,
                    _b;
            }
        });
        return __assign({}, datum, (_a = {}, _a[constants_1.SPLIT] = datum[constants_1.SPLIT].changeData(filledNestedDataset), _a));
    });
    return dataset.changeData(newDataset);
};
//# sourceMappingURL=dataset.js.map