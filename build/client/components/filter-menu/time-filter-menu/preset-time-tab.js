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
var React = require("react");
var filter_clause_1 = require("../../../../common/models/filter-clause/filter-clause");
var time_shift_1 = require("../../../../common/models/time-shift/time-shift");
var duration_1 = require("../../../../common/utils/plywood/duration");
var time_1 = require("../../../../common/utils/time/time");
var constants_1 = require("../../../config/constants");
var button_group_1 = require("../../button-group/button-group");
var button_1 = require("../../button/button");
var string_input_with_presets_1 = require("../../input-with-presets/string-input-with-presets");
var presets_1 = require("./presets");
var time_shift_selector_1 = require("./time-shift-selector");
function initialState(essence, dimension) {
    var filterClause = essence.filter.getClauseForDimension(dimension);
    var timeShift = essence.timeShift.toJS();
    if (filterClause instanceof filter_clause_1.RelativeTimeFilterClause) {
        var duration = filterClause.duration, period = filterClause.period;
        return { timeShift: timeShift, filterDuration: duration.toJS(), filterPeriod: period };
    }
    return {
        filterPeriod: null,
        filterDuration: null,
        timeShift: timeShift
    };
}
function constructFilter(period, duration, reference) {
    return new filter_clause_1.RelativeTimeFilterClause({ period: period, duration: chronoshift_1.Duration.fromJS(duration), reference: reference });
}
var PresetTimeTab = (function (_super) {
    __extends(PresetTimeTab, _super);
    function PresetTimeTab() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.setFilter = function (filterPeriod, filterDuration) { return _this.setState({ filterDuration: filterDuration, filterPeriod: filterPeriod }); };
        _this.setTimeShift = function (timeShift) { return _this.setState({ timeShift: timeShift }); };
        _this.state = initialState(_this.props.essence, _this.props.dimension);
        _this.saveTimeFilter = function () {
            if (!_this.validate())
                return;
            var _a = _this.props, clicker = _a.clicker, onClose = _a.onClose;
            clicker.changeFilter(_this.constructRelativeFilter());
            clicker.changeComparisonShift(_this.constructTimeShift());
            onClose();
        };
        return _this;
    }
    PresetTimeTab.prototype.constructTimeShift = function () {
        return time_shift_1.TimeShift.fromJS(this.state.timeShift);
    };
    PresetTimeTab.prototype.constructRelativeFilter = function () {
        var _a = this.props, essence = _a.essence, dimensionName = _a.dimension.name;
        var _b = this.state, filterPeriod = _b.filterPeriod, filterDuration = _b.filterDuration;
        return essence.filter.setClause(constructFilter(filterPeriod, filterDuration, dimensionName));
    };
    PresetTimeTab.prototype.doesTimeShiftOverlap = function () {
        var timeShift = this.constructTimeShift();
        if (timeShift.isEmpty())
            return false;
        var timeShiftDuration = timeShift.valueOf();
        var filterDuration = chronoshift_1.Duration.fromJS(this.state.filterDuration);
        return filterDuration.getCanonicalLength() > timeShiftDuration.getCanonicalLength();
    };
    PresetTimeTab.prototype.isTimeShiftValid = function () {
        return time_shift_1.isValidTimeShift(this.state.timeShift);
    };
    PresetTimeTab.prototype.isDurationValid = function () {
        return duration_1.isValidDuration(this.state.filterDuration);
    };
    PresetTimeTab.prototype.validateOverlap = function () {
        var periodOverlaps = this.isTimeShiftValid() && this.isDurationValid() && this.doesTimeShiftOverlap();
        return periodOverlaps ? constants_1.STRINGS.overlappingPeriods : null;
    };
    PresetTimeTab.prototype.isFormValid = function () {
        var filterPeriod = this.state.filterPeriod;
        return filterPeriod && this.isDurationValid() && this.isTimeShiftValid() && !this.doesTimeShiftOverlap();
    };
    PresetTimeTab.prototype.isFilterDifferent = function () {
        var _a = this.props.essence, filter = _a.filter, timeShift = _a.timeShift;
        var newTimeShift = this.constructTimeShift();
        var newFilter = this.constructRelativeFilter();
        return !filter.equals(newFilter) || !timeShift.equals(newTimeShift);
    };
    PresetTimeTab.prototype.validate = function () {
        return this.isFormValid() && this.isFilterDifferent();
    };
    PresetTimeTab.prototype.renderLatestPresets = function () {
        var _this = this;
        var _a = this.state, filterDuration = _a.filterDuration, filterPeriod = _a.filterPeriod;
        var presets = presets_1.LATEST_PRESETS.map(function (_a) {
            var name = _a.name, duration = _a.duration;
            return { name: name, identity: duration };
        });
        var latestPeriod = filterPeriod === filter_clause_1.TimeFilterPeriod.LATEST;
        return React.createElement(string_input_with_presets_1.StringInputWithPresets, { title: constants_1.STRINGS.latest, presets: presets, errorMessage: latestPeriod && !duration_1.isValidDuration(filterDuration) && constants_1.STRINGS.invalidDurationFormat, selected: latestPeriod ? filterDuration : undefined, onChange: function (duration) { return _this.setFilter(filter_clause_1.TimeFilterPeriod.LATEST, duration); }, placeholder: constants_1.STRINGS.durationsExamples });
    };
    PresetTimeTab.prototype.renderButtonGroup = function (title, period) {
        var _this = this;
        var _a = this.state, filterDuration = _a.filterDuration, filterPeriod = _a.filterPeriod;
        var activePeriod = period === filterPeriod;
        var presets = presets_1.getTimeFilterPresets(period);
        var groupMembers = presets.map(function (_a) {
            var duration = _a.duration, name = _a.name;
            return {
                title: name,
                key: name,
                isSelected: activePeriod && filterDuration === duration,
                onClick: function () { return _this.setFilter(period, duration); }
            };
        });
        return React.createElement(button_group_1.ButtonGroup, { title: title, groupMembers: groupMembers });
    };
    PresetTimeTab.prototype.getFilterRange = function () {
        var _a = this.state, filterPeriod = _a.filterPeriod, filterDuration = _a.filterDuration;
        var dimensionName = this.props.dimension.name;
        if (!duration_1.isValidDuration(filterDuration))
            return null;
        var filter = constructFilter(filterPeriod, filterDuration, dimensionName);
        if (!filter)
            return null;
        var _b = this.props, essence = _b.essence, timekeeper = _b.timekeeper;
        var fixedFilter = essence.evaluateSelection(filter, timekeeper);
        return fixedFilter.values.get(0);
    };
    PresetTimeTab.prototype.render = function () {
        var _a = this.props, essence = _a.essence, dimension = _a.dimension;
        if (!dimension)
            return null;
        var timeShift = this.state.timeShift;
        var timezone = essence.timezone;
        var previewFilter = this.getFilterRange();
        var previewText = previewFilter ? time_1.formatTimeRange(previewFilter, timezone) : constants_1.STRINGS.noFilter;
        var overlapError = this.validateOverlap();
        return React.createElement("div", { className: "cont" },
            essence.dataCube.isTimeAttribute(dimension.expression) && this.renderLatestPresets(),
            this.renderButtonGroup(constants_1.STRINGS.current, filter_clause_1.TimeFilterPeriod.CURRENT),
            this.renderButtonGroup(constants_1.STRINGS.previous, filter_clause_1.TimeFilterPeriod.PREVIOUS),
            React.createElement("div", { className: "preview preview--with-spacing" }, previewText),
            React.createElement(time_shift_selector_1.TimeShiftSelector, { shift: timeShift, time: previewFilter, timezone: essence.timezone, onShiftChange: this.setTimeShift }),
            overlapError && React.createElement("div", { className: "overlap-error-message" }, overlapError),
            React.createElement("div", { className: "ok-cancel-bar" },
                React.createElement(button_1.Button, { type: "primary", onClick: this.saveTimeFilter, disabled: !this.validate(), title: constants_1.STRINGS.ok }),
                React.createElement(button_1.Button, { type: "secondary", onClick: this.props.onClose, title: constants_1.STRINGS.cancel })));
    };
    return PresetTimeTab;
}(React.Component));
exports.PresetTimeTab = PresetTimeTab;
//# sourceMappingURL=preset-time-tab.js.map