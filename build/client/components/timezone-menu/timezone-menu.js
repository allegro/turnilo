"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var stage_1 = require("../../../common/models/stage/stage");
var constants_1 = require("../../config/constants");
var bubble_menu_1 = require("../bubble-menu/bubble-menu");
var dropdown_1 = require("../dropdown/dropdown");
require("./timezone-menu.scss");
exports.TimezoneMenu = function (_a) {
    var timezone = _a.timezone, timezones = _a.timezones, onClose = _a.onClose, changeTimezone = _a.changeTimezone, openOn = _a.openOn;
    function selectTimezone(newTimezone) {
        changeTimezone(newTimezone);
        onClose();
    }
    return React.createElement(bubble_menu_1.BubbleMenu, { className: "timezone-menu", direction: "down", stage: stage_1.Stage.fromSize(240, 200), openOn: openOn, onClose: onClose },
        React.createElement(dropdown_1.Dropdown, { label: constants_1.STRINGS.timezone, selectedItem: timezone, renderItem: function (d) { return d.toString().replace(/_/g, " "); }, items: timezones, onSelect: selectTimezone }));
};
//# sourceMappingURL=timezone-menu.js.map