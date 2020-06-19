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
var chronoshift_1 = require("chronoshift");
var immutable_1 = require("immutable");
var filter_clause_1 = require("../filter-clause/filter-clause");
var granularity_1 = require("../granularity/granularity");
var sort_1 = require("../sort/sort");
var split_1 = require("../split/split");
var timekeeper_1 = require("../timekeeper/timekeeper");
var defaultSplits = { splits: immutable_1.List([]) };
var Splits = (function (_super) {
    __extends(Splits, _super);
    function Splits() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Splits.fromSplit = function (split) {
        return new Splits({ splits: immutable_1.List([split]) });
    };
    Splits.fromSplits = function (splits) {
        return new Splits({ splits: immutable_1.List(splits) });
    };
    Splits.fromDimensions = function (dimensions) {
        var splits = dimensions.map(function (dimension) { return split_1.Split.fromDimension(dimension); });
        return new Splits({ splits: splits });
    };
    Splits.prototype.toString = function () {
        return this.splits.map(function (split) { return split.toString(); }).join(",");
    };
    Splits.prototype.replaceByIndex = function (index, replace) {
        var splits = this.splits;
        if (splits.count() === index) {
            return this.insertByIndex(index, replace);
        }
        return this.updateSplits(function (splits) {
            var newSplitIndex = splits.findIndex(function (split) { return split.equals(replace); });
            if (newSplitIndex === -1)
                return splits.set(index, replace);
            var oldSplit = splits.get(index);
            return splits
                .set(index, replace)
                .set(newSplitIndex, oldSplit);
        });
    };
    Splits.prototype.insertByIndex = function (index, insert) {
        return this.updateSplits(function (splits) {
            return splits
                .insert(index, insert)
                .filterNot(function (split, idx) { return split.equals(insert) && idx !== index; });
        });
    };
    Splits.prototype.addSplit = function (split) {
        var splits = this.splits;
        return this.insertByIndex(splits.count(), split);
    };
    Splits.prototype.removeSplit = function (split) {
        return this.updateSplits(function (splits) { return splits.filter(function (s) { return s.reference !== split.reference; }); });
    };
    Splits.prototype.changeSort = function (sort) {
        return this.updateSplits(function (splits) { return splits.map(function (s) { return s.changeSort(sort); }); });
    };
    Splits.prototype.setSortToDimension = function () {
        return this.updateSplits(function (splits) {
            return splits.map(function (split) {
                return split.changeSort(new sort_1.DimensionSort({ reference: split.reference }));
            });
        });
    };
    Splits.prototype.length = function () {
        return this.splits.count();
    };
    Splits.prototype.getSplit = function (index) {
        return this.splits.get(index);
    };
    Splits.prototype.findSplitForDimension = function (_a) {
        var name = _a.name;
        return this.splits.find(function (s) { return s.reference === name; });
    };
    Splits.prototype.hasSplitOn = function (dimension) {
        return Boolean(this.findSplitForDimension(dimension));
    };
    Splits.prototype.replace = function (search, replace) {
        return this.updateSplits(function (splits) { return splits.map(function (s) { return s.equals(search) ? replace : s; }); });
    };
    Splits.prototype.removeBucketingFrom = function (references) {
        return this.updateSplits(function (splits) { return splits.map(function (split) {
            if (!split.bucket || !references.has(split.reference))
                return split;
            return split.changeBucket(null);
        }); });
    };
    Splits.prototype.updateWithFilter = function (filter, dimensions) {
        var specificFilter = filter.getSpecificFilter(timekeeper_1.Timekeeper.globalNow(), timekeeper_1.Timekeeper.globalNow(), chronoshift_1.Timezone.UTC);
        return this.updateSplits(function (splits) { return splits.map(function (split) {
            var bucket = split.bucket, reference = split.reference;
            if (bucket)
                return split;
            var splitDimension = dimensions.getDimensionByName(reference);
            var splitKind = splitDimension.kind;
            if (!splitDimension || !(splitKind === "time" || splitKind === "number") || !splitDimension.canBucketByDefault()) {
                return split;
            }
            if (splitKind === "time") {
                var clause = specificFilter.clauses.find(function (clause) { return clause instanceof filter_clause_1.FixedTimeFilterClause; });
                return split.changeBucket(clause
                    ? granularity_1.getBestBucketUnitForRange(clause.values.first(), false, splitDimension.bucketedBy, splitDimension.granularities)
                    : granularity_1.getDefaultGranularityForKind("time", splitDimension.bucketedBy, splitDimension.granularities));
            }
            else if (splitKind === "number") {
                var clause = specificFilter.clauses.find(function (clause) { return clause instanceof filter_clause_1.NumberFilterClause; });
                return split.changeBucket(clause
                    ? granularity_1.getBestBucketUnitForRange(clause.values.first(), false, splitDimension.bucketedBy, splitDimension.granularities)
                    : granularity_1.getDefaultGranularityForKind("number", splitDimension.bucketedBy, splitDimension.granularities));
            }
            throw new Error("unknown extent type");
        }); });
    };
    Splits.prototype.constrainToDimensionsAndSeries = function (dimensions, series) {
        function validSplit(split) {
            if (!dimensions.getDimensionByName(split.reference))
                return false;
            if (sort_1.isSortEmpty(split.sort))
                return true;
            var sortRef = split.sort.reference;
            return dimensions.containsDimensionWithName(sortRef) || series.hasSeriesWithKey(sortRef);
        }
        return this.updateSplits(function (splits) { return splits.filter(validSplit); });
    };
    Splits.prototype.changeSortIfOnMeasure = function (fromMeasure, toMeasure) {
        return this.updateSplits(function (splits) { return splits.map(function (split) {
            var sort = split.sort;
            if (!sort || sort.reference !== fromMeasure)
                return split;
            return split.setIn(["sort", "reference"], toMeasure);
        }); });
    };
    Splits.prototype.getCommonSort = function () {
        var splits = this.splits;
        if (splits.count() === 0)
            return null;
        var commonSort = splits.get(0).sort;
        return splits.every(function (_a) {
            var sort = _a.sort;
            return sort.equals(commonSort);
        }) ? commonSort : null;
    };
    Splits.prototype.updateSplits = function (updater) {
        return this.update("splits", updater);
    };
    Splits.prototype.slice = function (from, to) {
        return this.updateSplits(function (splits) { return splits.slice(from, to); });
    };
    return Splits;
}(immutable_1.Record(defaultSplits)));
exports.Splits = Splits;
exports.EMPTY_SPLITS = new Splits({ splits: immutable_1.List([]) });
//# sourceMappingURL=splits.js.map