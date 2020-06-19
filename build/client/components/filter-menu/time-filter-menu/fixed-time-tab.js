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
var React = require("react");
var date_range_1 = require("../../../../common/models/date-range/date-range");
var filter_clause_1 = require("../../../../common/models/filter-clause/filter-clause");
var time_shift_1 = require("../../../../common/models/time-shift/time-shift");
var constants_1 = require("../../../config/constants");
var button_1 = require("../../button/button");
var date_range_picker_1 = require("../../date-range-picker/date-range-picker");
var time_shift_selector_1 = require("./time-shift-selector");
var FixedTimeTab = (function (_super) {
    __extends(FixedTimeTab, _super);
    function FixedTimeTab() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.initialState = function () {
            var _a = _this.props, essence = _a.essence, timekeeper = _a.timekeeper, name = _a.dimension.name;
            var shift = essence.timeShift.toJS();
            var timeFilter = essence.getEffectiveFilter(timekeeper).clauseForReference(name);
            if (timeFilter && timeFilter instanceof filter_clause_1.FixedTimeFilterClause && !timeFilter.values.isEmpty()) {
                var _b = timeFilter.values.get(0), start = _b.start, end = _b.end;
                return { start: start, end: end, shift: shift };
            }
            return { start: null, end: null, shift: shift };
        };
        _this.onStartChange = function (start) { return _this.setState({ start: start }); };
        _this.onEndChange = function (end) { return _this.setState({ end: end }); };
        _this.setTimeShift = function (shift) { return _this.setState({ shift: shift }); };
        _this.state = _this.initialState();
        _this.onOkClick = function () {
            if (!_this.validate())
                return;
            var _a = _this.props, clicker = _a.clicker, onClose = _a.onClose;
            clicker.changeFilter(_this.constructFixedFilter());
            clicker.changeComparisonShift(_this.constructTimeShift());
            onClose();
        };
        return _this;
    }
    FixedTimeTab.prototype.createDateRange = function () {
        var _a = this.state, start = _a.start, maybeEnd = _a.end;
        if (!start)
            return null;
        var timezone = this.props.essence.timezone;
        var end = maybeEnd || chronoshift_1.day.shift(start, timezone, 1);
        if (start >= end)
            return null;
        return new date_range_1.DateRange({ start: start, end: end });
    };
    FixedTimeTab.prototype.constructFixedFilter = function () {
        var _a = this.props, filter = _a.essence.filter, name = _a.dimension.name;
        var clause = new filter_clause_1.FixedTimeFilterClause({ reference: name, values: immutable_1.List.of(this.createDateRange()) });
        return filter.setClause(clause);
    };
    FixedTimeTab.prototype.constructTimeShift = function () {
        return time_shift_1.TimeShift.fromJS(this.state.shift);
    };
    FixedTimeTab.prototype.doesTimeShiftOverlap = function () {
        var shift = this.constructTimeShift();
        if (shift.isEmpty())
            return false;
        var timezone = this.props.essence.timezone;
        var currentRange = this.createDateRange();
        var duration = shift.valueOf();
        var previousRange = currentRange.shift(duration, timezone);
        return currentRange.intersects(previousRange);
    };
    FixedTimeTab.prototype.validateOverlap = function () {
        var periodsOverlap = this.isTimeShiftValid() && this.areDatesValid() && this.doesTimeShiftOverlap();
        return periodsOverlap ? constants_1.STRINGS.overlappingPeriods : null;
    };
    FixedTimeTab.prototype.isTimeShiftValid = function () {
        return time_shift_1.isValidTimeShift(this.state.shift);
    };
    FixedTimeTab.prototype.areDatesValid = function () {
        return this.createDateRange() !== null;
    };
    FixedTimeTab.prototype.isFormValid = function () {
        return this.areDatesValid() && this.isTimeShiftValid() && !this.doesTimeShiftOverlap();
    };
    FixedTimeTab.prototype.isFilterDifferent = function () {
        var _a = this.props.essence, filter = _a.filter, timeShift = _a.timeShift;
        var newTimeShift = this.constructTimeShift();
        var newFilter = this.constructFixedFilter();
        return !filter.equals(newFilter) || !timeShift.equals(newTimeShift);
    };
    FixedTimeTab.prototype.validate = function () {
        return this.isFormValid() && this.isFilterDifferent();
    };
    FixedTimeTab.prototype.render = function () {
        var _a = this.props, _b = _a.essence, timezone = _b.timezone, dataCube = _b.dataCube, timekeeper = _a.timekeeper, dimension = _a.dimension, onClose = _a.onClose;
        if (!dimension)
            return null;
        var _c = this.state, shift = _c.shift, start = _c.start, end = _c.end;
        var overlapError = this.validateOverlap();
        return React.createElement("div", null,
            React.createElement(date_range_picker_1.DateRangePicker, { startTime: start, endTime: end, maxTime: dataCube.getMaxTime(timekeeper), timezone: timezone, onStartChange: this.onStartChange, onEndChange: this.onEndChange }),
            React.createElement("div", { className: "cont" },
                React.createElement(time_shift_selector_1.TimeShiftSelector, { shift: shift, time: this.createDateRange(), onShiftChange: this.setTimeShift, timezone: timezone }),
                overlapError && React.createElement("div", { className: "overlap-error-message" }, overlapError)),
            React.createElement("div", { className: "ok-cancel-bar" },
                React.createElement(button_1.Button, { type: "primary", onClick: this.onOkClick, disabled: !this.validate(), title: constants_1.STRINGS.ok }),
                React.createElement(button_1.Button, { type: "secondary", onClick: onClose, title: constants_1.STRINGS.cancel })));
    };
    return FixedTimeTab;
}(React.Component));
exports.FixedTimeTab = FixedTimeTab;
//# sourceMappingURL=fixed-time-tab.js.map