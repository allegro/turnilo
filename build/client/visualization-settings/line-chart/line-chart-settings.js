"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var checkbox_1 = require("../../components/checkbox/checkbox");
exports.LineChartSettingsComponent = function (_a) {
    var settings = _a.settings, onChange = _a.onChange;
    var toggleGroupSeries = function () { return onChange(settings.update("groupSeries", function (groupSeries) { return !groupSeries; })); };
    return React.createElement("div", { className: "settings-row" },
        React.createElement(checkbox_1.Checkbox, { selected: settings.groupSeries, label: "Group series", onClick: toggleGroupSeries }));
};
//# sourceMappingURL=line-chart-settings.js.map