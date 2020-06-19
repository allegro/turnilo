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
var React = require("react");
var time_1 = require("../../../common/utils/time/time");
require("./date-range-input.scss");
var DateRangeInput = (function (_super) {
    __extends(DateRangeInput, _super);
    function DateRangeInput() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            dateString: "",
            timeString: ""
        };
        _this.dateChange = function (e) {
            var dateString = time_1.normalizeISODate(e.target.value);
            _this.setState({
                dateString: dateString
            });
            if (time_1.validateISODate(dateString)) {
                _this.changeDate(dateString, _this.state.timeString);
            }
        };
        _this.timeChange = function (e) {
            var timeString = time_1.normalizeISOTime(e.target.value);
            _this.setState({
                timeString: timeString
            });
            if (time_1.validateISOTime(timeString)) {
                _this.changeDate(_this.state.dateString, timeString);
            }
        };
        return _this;
    }
    DateRangeInput.prototype.componentDidMount = function () {
        var _a = this.props, time = _a.time, timezone = _a.timezone;
        this.updateStateFromTime(time, timezone);
    };
    DateRangeInput.prototype.componentWillReceiveProps = function (nextProps) {
        var time = nextProps.time, timezone = nextProps.timezone;
        this.updateStateFromTime(time, timezone);
    };
    DateRangeInput.prototype.updateStateFromTime = function (time, timezone) {
        if (!time)
            return;
        if (isNaN(time.valueOf())) {
            this.setState({
                dateString: ""
            });
            return;
        }
        this.setState({
            dateString: time_1.formatISODate(time, timezone),
            timeString: time_1.formatISOTime(time, timezone)
        });
    };
    DateRangeInput.prototype.changeDate = function (possibleDateString, possibleTimeString) {
        var _a = this.props, timezone = _a.timezone, onChange = _a.onChange;
        var possibleMoment = time_1.combineDateAndTimeIntoMoment(possibleDateString, possibleTimeString, timezone);
        if (possibleMoment && possibleMoment.isValid()) {
            onChange(possibleMoment.toDate());
        }
    };
    DateRangeInput.prototype.render = function () {
        var _a = this.props, hide = _a.hide, label = _a.label;
        var _b = this.state, dateString = _b.dateString, timeString = _b.timeString;
        var dateValue = hide ? "" : dateString;
        var timeValue = hide ? "" : timeString;
        return React.createElement("div", { className: "date-range-input" },
            React.createElement("div", { className: "label" }, label),
            React.createElement("input", { placeholder: "YYYY-MM-DD", className: "date-field", value: dateValue, onChange: this.dateChange }),
            React.createElement("input", { placeholder: "HH:MM", className: "time-field", value: timeValue, onChange: this.timeChange }));
    };
    return DateRangeInput;
}(React.Component));
exports.DateRangeInput = DateRangeInput;
//# sourceMappingURL=date-range-input.js.map