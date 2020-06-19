"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chronoshift_1 = require("chronoshift");
var React = require("react");
var time_shift_1 = require("../../../../common/models/time-shift/time-shift");
var time_1 = require("../../../../common/utils/time/time");
var constants_1 = require("../../../config/constants");
var string_input_with_presets_1 = require("../../input-with-presets/string-input-with-presets");
var presets_1 = require("./presets");
function safeDurationFromJS(duration) {
    try {
        return chronoshift_1.Duration.fromJS(duration);
    }
    catch (_a) {
        return null;
    }
}
function timeShiftPreviewForRange(_a) {
    var shift = _a.shift, time = _a.time, timezone = _a.timezone;
    if (time === null || !time.start || !time.end)
        return null;
    var duration = safeDurationFromJS(shift);
    if (duration === null)
        return null;
    var shiftedTimeRange = time.shift(duration, timezone);
    return time_1.formatTimeRange(shiftedTimeRange, timezone);
}
var presets = presets_1.COMPARISON_PRESETS.map(function (_a) {
    var shift = _a.shift, label = _a.label;
    return ({
        name: label,
        identity: shift.toJS()
    });
});
exports.TimeShiftSelector = function (props) {
    var onShiftChange = props.onShiftChange, selectedTimeShift = props.shift;
    var timeShiftPreview = timeShiftPreviewForRange(props);
    return React.createElement(React.Fragment, null,
        React.createElement(string_input_with_presets_1.StringInputWithPresets, { title: constants_1.STRINGS.timeShift, presets: presets, selected: selectedTimeShift, onChange: onShiftChange, errorMessage: time_shift_1.isValidTimeShift(selectedTimeShift) ? null : constants_1.STRINGS.invalidDurationFormat, placeholder: constants_1.STRINGS.timeShiftExamples }),
        timeShiftPreview ? React.createElement("div", { className: "preview" }, timeShiftPreview) : null);
};
//# sourceMappingURL=time-shift-selector.js.map