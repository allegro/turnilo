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
var presets_1 = require("../../../client/components/filter-menu/time-filter-menu/presets");
var date_range_1 = require("../date-range/date-range");
var time_1 = require("../time/time");
var FilterTypes;
(function (FilterTypes) {
    FilterTypes["BOOLEAN"] = "boolean";
    FilterTypes["NUMBER"] = "number";
    FilterTypes["STRING"] = "string";
    FilterTypes["FIXED_TIME"] = "fixed_time";
    FilterTypes["RELATIVE_TIME"] = "relative_time";
})(FilterTypes = exports.FilterTypes || (exports.FilterTypes = {}));
var defaultBooleanFilter = {
    reference: null,
    type: FilterTypes.BOOLEAN,
    not: false,
    values: immutable_1.Set([])
};
var BooleanFilterClause = (function (_super) {
    __extends(BooleanFilterClause, _super);
    function BooleanFilterClause(params) {
        return _super.call(this, params) || this;
    }
    return BooleanFilterClause;
}(immutable_1.Record(defaultBooleanFilter)));
exports.BooleanFilterClause = BooleanFilterClause;
var defaultNumberRange = { start: null, end: null, bounds: "[)" };
var NumberRange = (function (_super) {
    __extends(NumberRange, _super);
    function NumberRange() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NumberRange;
}(immutable_1.Record(defaultNumberRange)));
exports.NumberRange = NumberRange;
var defaultNumberFilter = {
    reference: null,
    type: FilterTypes.NUMBER,
    not: false,
    values: immutable_1.List([])
};
var NumberFilterClause = (function (_super) {
    __extends(NumberFilterClause, _super);
    function NumberFilterClause(params) {
        return _super.call(this, params) || this;
    }
    return NumberFilterClause;
}(immutable_1.Record(defaultNumberFilter)));
exports.NumberFilterClause = NumberFilterClause;
var StringFilterAction;
(function (StringFilterAction) {
    StringFilterAction["IN"] = "in";
    StringFilterAction["MATCH"] = "match";
    StringFilterAction["CONTAINS"] = "contains";
})(StringFilterAction = exports.StringFilterAction || (exports.StringFilterAction = {}));
var defaultStringFilter = {
    reference: null,
    type: FilterTypes.STRING,
    not: false,
    action: StringFilterAction.CONTAINS,
    values: immutable_1.Set([])
};
var StringFilterClause = (function (_super) {
    __extends(StringFilterClause, _super);
    function StringFilterClause(params) {
        return _super.call(this, params) || this;
    }
    return StringFilterClause;
}(immutable_1.Record(defaultStringFilter)));
exports.StringFilterClause = StringFilterClause;
var defaultFixedTimeFilter = {
    reference: null,
    type: FilterTypes.FIXED_TIME,
    values: immutable_1.List([])
};
var FixedTimeFilterClause = (function (_super) {
    __extends(FixedTimeFilterClause, _super);
    function FixedTimeFilterClause(params) {
        return _super.call(this, params) || this;
    }
    return FixedTimeFilterClause;
}(immutable_1.Record(defaultFixedTimeFilter)));
exports.FixedTimeFilterClause = FixedTimeFilterClause;
var TimeFilterPeriod;
(function (TimeFilterPeriod) {
    TimeFilterPeriod["PREVIOUS"] = "previous";
    TimeFilterPeriod["LATEST"] = "latest";
    TimeFilterPeriod["CURRENT"] = "current";
})(TimeFilterPeriod = exports.TimeFilterPeriod || (exports.TimeFilterPeriod = {}));
var defaultRelativeTimeFilter = {
    reference: null,
    type: FilterTypes.RELATIVE_TIME,
    period: TimeFilterPeriod.CURRENT,
    duration: null
};
var RelativeTimeFilterClause = (function (_super) {
    __extends(RelativeTimeFilterClause, _super);
    function RelativeTimeFilterClause(params) {
        return _super.call(this, params) || this;
    }
    RelativeTimeFilterClause.prototype.evaluate = function (now, maxTime, timezone) {
        var selection = presets_1.constructFilter(this.period, this.duration.toJS());
        var maxTimeMinuteTop = chronoshift_1.minute.shift(chronoshift_1.minute.floor(maxTime || now, timezone), timezone, 1);
        var datum = {};
        datum[time_1.NOW_REF_NAME] = now;
        datum[time_1.MAX_TIME_REF_NAME] = maxTimeMinuteTop;
        var _a = selection.defineEnvironment({ timezone: timezone }).getFn()(datum), start = _a.start, end = _a.end;
        return new FixedTimeFilterClause({ reference: this.reference, values: immutable_1.List.of(new date_range_1.DateRange({ start: start, end: end })) });
    };
    RelativeTimeFilterClause.prototype.equals = function (other) {
        return other instanceof RelativeTimeFilterClause &&
            this.reference === other.reference &&
            this.period === other.period &&
            this.duration.equals(other.duration);
    };
    return RelativeTimeFilterClause;
}(immutable_1.Record(defaultRelativeTimeFilter)));
exports.RelativeTimeFilterClause = RelativeTimeFilterClause;
function isTimeFilter(clause) {
    return clause instanceof FixedTimeFilterClause || clause instanceof RelativeTimeFilterClause;
}
exports.isTimeFilter = isTimeFilter;
function toExpression(clause, _a) {
    var expression = _a.expression;
    var type = clause.type;
    switch (type) {
        case FilterTypes.BOOLEAN: {
            var _b = clause, not = _b.not, values = _b.values;
            var boolExp = expression.overlap(plywood_1.r(values.toArray()));
            return not ? boolExp.not() : boolExp;
        }
        case FilterTypes.NUMBER: {
            var _c = clause, not = _c.not, values = _c.values;
            var elements = values.toArray().map(function (range) { return new plywood_1.NumberRange(range); });
            var set = new plywood_1.Set({ elements: elements, setType: "NUMBER_RANGE" });
            var numExp = expression.overlap(plywood_1.r(set));
            return not ? numExp.not() : numExp;
        }
        case FilterTypes.STRING: {
            var _d = clause, not = _d.not, action = _d.action, values = _d.values;
            var stringExp = null;
            switch (action) {
                case StringFilterAction.CONTAINS:
                    stringExp = expression.contains(plywood_1.r(values.first()));
                    break;
                case StringFilterAction.IN:
                    stringExp = expression.overlap(plywood_1.r(values.toArray()));
                    break;
                case StringFilterAction.MATCH:
                    stringExp = expression.match(values.first());
                    break;
            }
            return not ? stringExp.not() : stringExp;
        }
        case FilterTypes.FIXED_TIME: {
            var values = clause.values.toArray();
            var elements = values.map(function (value) { return new plywood_1.TimeRange(value); });
            return expression.overlap(plywood_1.r(new plywood_1.Set({ elements: elements, setType: "TIME_RANGE" })));
        }
        case FilterTypes.RELATIVE_TIME: {
            throw new Error("Can't call toExpression on RelativeFilterClause. Evaluate clause first");
        }
    }
}
exports.toExpression = toExpression;
function fromJS(parameters) {
    var type = parameters.type, reference = parameters.reference;
    switch (type) {
        case FilterTypes.BOOLEAN: {
            var _a = parameters, not = _a.not, values = _a.values;
            return new BooleanFilterClause({
                reference: reference,
                not: not,
                values: immutable_1.Set(values)
            });
        }
        case FilterTypes.NUMBER: {
            var _b = parameters, not = _b.not, values = _b.values;
            return new NumberFilterClause({
                reference: reference,
                not: not,
                values: immutable_1.List(values)
            });
        }
        case FilterTypes.STRING: {
            var _c = parameters, not = _c.not, values = _c.values, action = _c.action;
            return new StringFilterClause({
                reference: reference,
                action: action,
                not: not,
                values: immutable_1.Set(values)
            });
        }
        case FilterTypes.FIXED_TIME: {
            var values = parameters.values;
            return new FixedTimeFilterClause({
                reference: reference,
                values: immutable_1.List(values)
            });
        }
        case FilterTypes.RELATIVE_TIME: {
            var _d = parameters, period = _d.period, duration = _d.duration;
            return new RelativeTimeFilterClause({
                reference: reference,
                period: period,
                duration: chronoshift_1.Duration.fromJS(duration)
            });
        }
    }
}
exports.fromJS = fromJS;
//# sourceMappingURL=filter-clause.js.map