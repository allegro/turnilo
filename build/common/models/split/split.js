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
var plywood_1 = require("plywood");
var general_1 = require("../../utils/general/general");
var nullable_equals_1 = require("../../utils/immutable-utils/nullable-equals");
var sort_1 = require("../sort/sort");
var time_shift_env_1 = require("../time-shift/time-shift-env");
var SplitType;
(function (SplitType) {
    SplitType["number"] = "number";
    SplitType["string"] = "string";
    SplitType["time"] = "time";
})(SplitType = exports.SplitType || (exports.SplitType = {}));
var defaultSplit = {
    type: SplitType.string,
    reference: null,
    bucket: null,
    sort: new sort_1.DimensionSort({ reference: null }),
    limit: null
};
function bucketToAction(bucket) {
    return bucket instanceof chronoshift_1.Duration
        ? new plywood_1.TimeBucketExpression({ duration: bucket })
        : new plywood_1.NumberBucketExpression({ size: bucket });
}
exports.bucketToAction = bucketToAction;
function applyTimeShift(type, expression, env) {
    if (env.type === time_shift_env_1.TimeShiftEnvType.WITH_PREVIOUS && type === SplitType.time) {
        return env.currentFilter.then(expression).fallback(expression.timeShift(env.shift));
    }
    return expression;
}
function toExpression(_a, _b, env) {
    var bucket = _a.bucket, type = _a.type;
    var expression = _b.expression;
    var expWithShift = applyTimeShift(type, expression, env);
    if (!bucket)
        return expWithShift;
    return expWithShift.performAction(bucketToAction(bucket));
}
exports.toExpression = toExpression;
function kindToType(kind) {
    switch (kind) {
        case "time":
            return SplitType.time;
        case "number":
            return SplitType.number;
        default:
            return SplitType.string;
    }
}
exports.kindToType = kindToType;
var Split = (function (_super) {
    __extends(Split, _super);
    function Split() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Split.fromDimension = function (_a) {
        var name = _a.name, kind = _a.kind;
        return new Split({ reference: name, type: kindToType(kind) });
    };
    Split.prototype.toString = function () {
        return "[SplitCombine: " + this.reference + "]";
    };
    Split.prototype.toKey = function () {
        return this.reference;
    };
    Split.prototype.changeBucket = function (bucket) {
        return this.set("bucket", bucket);
    };
    Split.prototype.changeSort = function (sort) {
        return this.set("sort", sort);
    };
    Split.prototype.changeLimit = function (limit) {
        return this.set("limit", limit);
    };
    Split.prototype.getTitle = function (dimension) {
        return (dimension ? dimension.title : "?") + this.getBucketTitle();
    };
    Split.prototype.getBucketTitle = function () {
        var bucket = this.bucket;
        if (!general_1.isTruthy(bucket)) {
            return "";
        }
        if (bucket instanceof chronoshift_1.Duration) {
            return " (" + bucket.getDescription(true) + ")";
        }
        return " (by " + bucket + ")";
    };
    Split.prototype.equals = function (other) {
        if (this.type !== SplitType.time)
            return _super.prototype.equals.call(this, other);
        return other instanceof Split &&
            this.type === other.type &&
            this.reference === other.reference &&
            this.sort.equals(other.sort) &&
            this.limit === other.limit &&
            nullable_equals_1.default(this.bucket, other.bucket);
    };
    return Split;
}(immutable_1.Record(defaultSplit)));
exports.Split = Split;
//# sourceMappingURL=split.js.map