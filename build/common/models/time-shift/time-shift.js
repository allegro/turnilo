"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chronoshift_1 = require("chronoshift");
var filter_clause_1 = require("../filter-clause/filter-clause");
function isValidTimeShift(input) {
    try {
        TimeShift.fromJS(input);
        return true;
    }
    catch (_a) {
        return false;
    }
}
exports.isValidTimeShift = isValidTimeShift;
var TimeShift = (function () {
    function TimeShift(value) {
        this.value = value;
    }
    TimeShift.fromJS = function (timeShift) {
        if (timeShift === null) {
            return TimeShift.empty();
        }
        return new TimeShift(chronoshift_1.Duration.fromJS(timeShift));
    };
    TimeShift.empty = function () {
        return new TimeShift(null);
    };
    TimeShift.isTimeShift = function (candidate) {
        return candidate instanceof TimeShift;
    };
    TimeShift.prototype.equals = function (other) {
        if (!TimeShift.isTimeShift(other)) {
            return false;
        }
        if (this.value === null) {
            return other.value === null;
        }
        return this.value.equals(other.value);
    };
    TimeShift.prototype.toJS = function () {
        return this.value === null ? null : this.value.toJS();
    };
    TimeShift.prototype.toJSON = function () {
        return this.toJS();
    };
    TimeShift.prototype.valueOf = function () {
        return this.value;
    };
    TimeShift.prototype.isEmpty = function () {
        return this.value === null;
    };
    TimeShift.prototype.getDescription = function (capitalize) {
        if (capitalize === void 0) { capitalize = false; }
        return this.value.getDescription(capitalize);
    };
    TimeShift.prototype.toString = function () {
        return this.toJS() || "";
    };
    TimeShift.prototype.isValidForTimeFilter = function (timeFilter, timezone) {
        switch (timeFilter.type) {
            case filter_clause_1.FilterTypes.FIXED_TIME:
                var values = timeFilter.values;
                var range = values.first();
                return !range.intersects(range.shift(this.value, timezone));
            case filter_clause_1.FilterTypes.RELATIVE_TIME:
                var duration = timeFilter.duration;
                return this.value.getCanonicalLength() >= duration.getCanonicalLength();
            default:
                throw new Error("Unknown time filter: " + timeFilter);
        }
    };
    TimeShift.prototype.constrainToFilter = function (timeFilter, timezone) {
        return this.value && this.isValidForTimeFilter(timeFilter, timezone) ? this : TimeShift.empty();
    };
    return TimeShift;
}());
exports.TimeShift = TimeShift;
//# sourceMappingURL=time-shift.js.map