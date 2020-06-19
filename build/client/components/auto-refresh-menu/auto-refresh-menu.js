"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chronoshift_1 = require("chronoshift");
var React = require("react");
var stage_1 = require("../../../common/models/stage/stage");
var time_1 = require("../../../common/utils/time/time");
var constants_1 = require("../../config/constants");
var bubble_menu_1 = require("../bubble-menu/bubble-menu");
var dropdown_1 = require("../dropdown/dropdown");
require("./auto-refresh-menu.scss");
var AUTO_REFRESH_LABELS = {
    null: "Off",
    PT5S: "Every 5 seconds",
    PT15S: "Every 15 seconds",
    PT1M: "Every minute",
    PT5M: "Every 5 minutes",
    PT10M: "Every 10 minutes",
    PT30M: "Every 30 minutes"
};
var REFRESH_DURATIONS = [
    null,
    chronoshift_1.Duration.fromJS("PT5S"),
    chronoshift_1.Duration.fromJS("PT15S"),
    chronoshift_1.Duration.fromJS("PT1M"),
    chronoshift_1.Duration.fromJS("PT5M"),
    chronoshift_1.Duration.fromJS("PT10M"),
    chronoshift_1.Duration.fromJS("PT30M")
];
var STAGE = stage_1.Stage.fromSize(240, 200);
function renderRefreshIntervalDropdown(autoRefreshRate, setAutoRefreshRate) {
    return React.createElement(dropdown_1.Dropdown, { label: constants_1.STRINGS.autoUpdate, items: REFRESH_DURATIONS, selectedItem: autoRefreshRate, renderItem: function (d) { return AUTO_REFRESH_LABELS[String(d)] || "Custom " + d; }, onSelect: setAutoRefreshRate });
}
function updatedText(dataCube, timekeeper, timezone) {
    var refreshRule = dataCube.refreshRule;
    if (refreshRule.isRealtime()) {
        return "Updated ~1 second ago";
    }
    else if (refreshRule.isFixed()) {
        return "Fixed to " + time_1.formatDateTime(refreshRule.time, timezone);
    }
    else {
        var maxTime = dataCube.getMaxTime(timekeeper);
        if (!maxTime)
            return null;
        return "Updated " + time_1.formatTimeElapsed(maxTime, timezone) + " ago";
    }
}
exports.AutoRefreshMenu = function (_a) {
    var autoRefreshRate = _a.autoRefreshRate, setAutoRefreshRate = _a.setAutoRefreshRate, openOn = _a.openOn, onClose = _a.onClose, dataCube = _a.dataCube, refreshMaxTime = _a.refreshMaxTime, timekeeper = _a.timekeeper, timezone = _a.timezone;
    return React.createElement(bubble_menu_1.BubbleMenu, { className: "auto-refresh-menu", direction: "down", stage: STAGE, openOn: openOn, onClose: onClose },
        renderRefreshIntervalDropdown(autoRefreshRate, setAutoRefreshRate),
        React.createElement("button", { className: "update-now-button", onClick: refreshMaxTime }, "Update now"),
        React.createElement("div", { className: "update-info" }, updatedText(dataCube, timekeeper, timezone)));
};
//# sourceMappingURL=auto-refresh-menu.js.map