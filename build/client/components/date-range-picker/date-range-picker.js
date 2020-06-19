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
var plywood_1 = require("plywood");
var React = require("react");
var time_1 = require("../../../common/utils/time/time");
var constants_1 = require("../../config/constants");
var dom_1 = require("../../utils/dom/dom");
var date_range_input_1 = require("../date-range-input/date-range-input");
var svg_icon_1 = require("../svg-icon/svg-icon");
var calendar_1 = require("./calendar");
require("./date-range-picker.scss");
var DateRangePicker = (function (_super) {
    __extends(DateRangePicker, _super);
    function DateRangePicker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            activeMonthStartDate: chronoshift_1.month.floor(_this.props.startTime || new Date(), _this.props.timezone),
            hoverTimeRange: null,
            selectionSet: true
        };
        _this.goToPreviousMonth = function () { return _this.navigateToMonth(-1); };
        _this.goToNextMonth = function () { return _this.navigateToMonth(1); };
        _this.onCalendarMouseLeave = function () {
            _this.setState({ hoverTimeRange: null });
        };
        return _this;
    }
    DateRangePicker.prototype.navigateToMonth = function (offset) {
        var timezone = this.props.timezone;
        var activeMonthStartDate = this.state.activeMonthStartDate;
        var newDate = chronoshift_1.month.shift(activeMonthStartDate, timezone, offset);
        this.setState({
            activeMonthStartDate: newDate
        });
    };
    DateRangePicker.prototype.calculateHoverTimeRange = function (mouseEnteredDay) {
        var _a = this.props, startTime = _a.startTime, endTime = _a.endTime;
        var hoverTimeRange = null;
        if (startTime && !endTime) {
            var start = startTime;
            var end = mouseEnteredDay;
            if (mouseEnteredDay < startTime) {
                start = mouseEnteredDay;
                end = startTime;
            }
            hoverTimeRange = new plywood_1.TimeRange({ start: start, end: end, bounds: "[]" });
        }
        this.setState({ hoverTimeRange: hoverTimeRange });
    };
    DateRangePicker.prototype.selectNewRange = function (startDate, endDate) {
        var _a = this.props, onStartChange = _a.onStartChange, onEndChange = _a.onEndChange, timezone = _a.timezone;
        onStartChange(startDate);
        if (endDate)
            endDate = chronoshift_1.day.shift(endDate, timezone, 1);
        onEndChange(endDate);
    };
    DateRangePicker.prototype.selectDay = function (selection) {
        var startTime = this.props.startTime;
        var selectionSet = this.state.selectionSet;
        if (selectionSet) {
            this.setState({ hoverTimeRange: null, selectionSet: false });
            this.selectNewRange(selection, null);
        }
        else {
            var isDoubleClickSameDay = time_1.datesEqual(selection, startTime);
            var isBackwardSelection = selection < startTime;
            if (isDoubleClickSameDay) {
                this.selectNewRange(startTime, startTime);
            }
            else if (isBackwardSelection) {
                this.selectNewRange(selection, startTime);
            }
            else {
                this.selectNewRange(startTime, selection);
            }
            this.setState({ selectionSet: true });
        }
    };
    DateRangePicker.prototype.getIsSelectable = function (date) {
        var _a = this.state, hoverTimeRange = _a.hoverTimeRange, selectionSet = _a.selectionSet;
        var inHoverTimeRange = hoverTimeRange && hoverTimeRange.contains(date);
        return inHoverTimeRange && !selectionSet;
    };
    DateRangePicker.prototype.renderDays = function (weeks, monthStart) {
        var _this = this;
        var _a = this.props, startTime = _a.startTime, endTime = _a.endTime, maxTime = _a.maxTime, timezone = _a.timezone;
        var startDay = chronoshift_1.day.floor(startTime, timezone);
        var dayBeforeEnd = endTime && chronoshift_1.day.shift(endTime, timezone, -1);
        var nextMonthStart = chronoshift_1.month.shift(monthStart, timezone, 1);
        return weeks.map(function (daysInWeek, row) {
            return React.createElement("div", { className: "week", key: row },
                " ",
                daysInWeek.map(function (dayDate, column) {
                    var isPast = dayDate < monthStart;
                    var isFuture = dayDate >= nextMonthStart;
                    var isBeyondMaxRange = dayDate > maxTime;
                    var isSelected = startDay <= dayDate && dayDate < endTime;
                    var isSelectedEdgeStart = time_1.datesEqual(dayDate, startTime);
                    var isSelectedEdgeEnd = time_1.datesEqual(dayDate, dayBeforeEnd);
                    var className = dom_1.classNames("day", "value", {
                        "past": isPast,
                        "future": isFuture,
                        "beyond-max-range": isBeyondMaxRange,
                        "selectable": _this.getIsSelectable(dayDate),
                        "selected": isSelected,
                        "selected-edge": isSelectedEdgeStart || isSelectedEdgeEnd
                    });
                    return React.createElement("div", { className: className, key: column, onClick: _this.selectDay.bind(_this, dayDate), onMouseEnter: _this.calculateHoverTimeRange.bind(_this, dayDate) }, time_1.getDayInMonth(dayDate, timezone));
                }));
        });
    };
    DateRangePicker.prototype.renderCalendar = function (startDate) {
        var timezone = this.props.timezone;
        var weeks = calendar_1.calendarDays(startDate, timezone, constants_1.getLocale());
        return this.renderDays(weeks, startDate);
    };
    DateRangePicker.prototype.renderCalendarNav = function (startDate) {
        var timezone = this.props.timezone;
        return React.createElement("div", { className: "calendar-nav" },
            React.createElement("div", { className: "caret left", onClick: this.goToPreviousMonth },
                React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/full-caret-left.svg") })),
            time_1.formatYearMonth(startDate, timezone),
            React.createElement("div", { className: "caret right", onClick: this.goToNextMonth },
                React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/full-caret-right.svg") })));
    };
    DateRangePicker.prototype.render = function () {
        var _a = this.props, startTime = _a.startTime, endTime = _a.endTime, timezone = _a.timezone, onStartChange = _a.onStartChange, onEndChange = _a.onEndChange;
        var _b = this.state, activeMonthStartDate = _b.activeMonthStartDate, selectionSet = _b.selectionSet;
        if (!activeMonthStartDate)
            return null;
        return React.createElement("div", { className: "date-range-picker" },
            React.createElement("div", null,
                React.createElement(date_range_input_1.DateRangeInput, { label: "Start", type: "start", time: startTime, timezone: timezone, onChange: onStartChange }),
                React.createElement(date_range_input_1.DateRangeInput, { label: "End", type: "end", time: endTime, timezone: timezone, onChange: onEndChange, hide: !selectionSet })),
            React.createElement("div", { className: "calendar", onMouseLeave: this.onCalendarMouseLeave },
                this.renderCalendarNav(activeMonthStartDate),
                React.createElement("div", { className: "week" }, constants_1.getLocale().shortDays.map(function (day, i) {
                    return React.createElement("div", { className: "day label", key: day + i },
                        React.createElement("span", { className: "space" }),
                        day);
                })),
                this.renderCalendar(activeMonthStartDate)));
    };
    return DateRangePicker;
}(React.Component));
exports.DateRangePicker = DateRangePicker;
//# sourceMappingURL=date-range-picker.js.map