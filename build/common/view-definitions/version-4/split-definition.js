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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var chronoshift_1 = require("chronoshift");
var limit_1 = require("../../limit/limit");
var concrete_series_1 = require("../../models/series/concrete-series");
var sort_1 = require("../../models/sort/sort");
var split_1 = require("../../models/split/split");
var general_1 = require("../../utils/general/general");
var PREVIOUS_PREFIX = "_previous__";
var DELTA_PREFIX = "_delta__";
function inferType(type, reference, dimensionName) {
    switch (type) {
        case sort_1.SortType.DIMENSION:
            return sort_1.SortType.DIMENSION;
        case sort_1.SortType.SERIES:
            return sort_1.SortType.SERIES;
        default:
            return reference === dimensionName ? sort_1.SortType.DIMENSION : sort_1.SortType.SERIES;
    }
}
function inferPeriodAndReference(_a) {
    var ref = _a.ref, period = _a.period;
    if (period)
        return { period: period, reference: ref };
    if (ref.indexOf(PREVIOUS_PREFIX) === 0)
        return { reference: ref.substring(PREVIOUS_PREFIX.length), period: concrete_series_1.SeriesDerivation.PREVIOUS };
    if (ref.indexOf(DELTA_PREFIX) === 0)
        return { reference: ref.substring(DELTA_PREFIX.length), period: concrete_series_1.SeriesDerivation.DELTA };
    return { reference: ref, period: concrete_series_1.SeriesDerivation.CURRENT };
}
function toSort(sort, dimensionName) {
    var direction = sort.direction;
    var _a = inferPeriodAndReference(sort), reference = _a.reference, period = _a.period;
    var type = inferType(sort.type, reference, dimensionName);
    switch (type) {
        case sort_1.SortType.DIMENSION:
            return new sort_1.DimensionSort({ reference: reference, direction: direction });
        case sort_1.SortType.SERIES:
            return new sort_1.SeriesSort({ reference: reference, direction: direction, period: period });
    }
}
function fromSort(sort) {
    var _a = sort.toJS(), ref = _a.reference, rest = __rest(_a, ["reference"]);
    return __assign({ ref: ref }, rest);
}
function toLimit(limit) {
    if (limit === null)
        return null;
    if (general_1.isNumber(limit) && general_1.isFiniteNumber(limit))
        return limit;
    return limit_1.AVAILABLE_LIMITS[0];
}
var numberSplitConversion = {
    toSplitCombine: function (split) {
        var dimension = split.dimension, limit = split.limit, sort = split.sort, granularity = split.granularity;
        return new split_1.Split({
            type: split_1.SplitType.number,
            reference: dimension,
            bucket: granularity,
            sort: sort && toSort(sort, dimension),
            limit: toLimit(limit)
        });
    },
    fromSplitCombine: function (_a) {
        var bucket = _a.bucket, sort = _a.sort, reference = _a.reference, limit = _a.limit;
        if (typeof bucket === "number") {
            return {
                type: split_1.SplitType.number,
                dimension: reference,
                granularity: bucket,
                sort: sort && fromSort(sort),
                limit: limit
            };
        }
        else {
            throw new Error("");
        }
    }
};
var timeSplitConversion = {
    toSplitCombine: function (split) {
        var dimension = split.dimension, limit = split.limit, sort = split.sort, granularity = split.granularity;
        return new split_1.Split({
            type: split_1.SplitType.time,
            reference: dimension,
            bucket: chronoshift_1.Duration.fromJS(granularity),
            sort: sort && toSort(sort, dimension),
            limit: toLimit(limit)
        });
    },
    fromSplitCombine: function (_a) {
        var limit = _a.limit, sort = _a.sort, reference = _a.reference, bucket = _a.bucket;
        if (bucket instanceof chronoshift_1.Duration) {
            return {
                type: split_1.SplitType.time,
                dimension: reference,
                granularity: bucket.toJS(),
                sort: sort && fromSort(sort),
                limit: limit
            };
        }
        else {
            throw new Error("");
        }
    }
};
var stringSplitConversion = {
    toSplitCombine: function (split) {
        var dimension = split.dimension, limit = split.limit, sort = split.sort;
        return new split_1.Split({
            reference: dimension,
            sort: sort && toSort(sort, dimension),
            limit: toLimit(limit)
        });
    },
    fromSplitCombine: function (_a) {
        var limit = _a.limit, sort = _a.sort, reference = _a.reference;
        return {
            type: split_1.SplitType.string,
            dimension: reference,
            sort: sort && fromSort(sort),
            limit: limit
        };
    }
};
var splitConversions = {
    number: numberSplitConversion,
    string: stringSplitConversion,
    time: timeSplitConversion
};
exports.splitConverter = {
    toSplitCombine: function (split) {
        return splitConversions[split.type].toSplitCombine(split);
    },
    fromSplitCombine: function (splitCombine) {
        var bucket = splitCombine.bucket;
        if (bucket instanceof chronoshift_1.Duration) {
            return timeSplitConversion.fromSplitCombine(splitCombine);
        }
        else if (typeof bucket === "number") {
            return numberSplitConversion.fromSplitCombine(splitCombine);
        }
        else {
            return stringSplitConversion.fromSplitCombine(splitCombine);
        }
    }
};
//# sourceMappingURL=split-definition.js.map