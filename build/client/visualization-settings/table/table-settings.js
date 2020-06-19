"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var checkbox_1 = require("../../components/checkbox/checkbox");
exports.TableSettingsComponent = function (_a) {
    var settings = _a.settings, onChange = _a.onChange;
    var toggleCollapseRows = function () { return onChange(settings.update("collapseRows", function (collapse) { return !collapse; })); };
    return React.createElement("div", { className: "settings-row" },
        React.createElement(checkbox_1.Checkbox, { selected: settings.collapseRows, label: "Collapse rows", onClick: toggleCollapseRows }));
};
//# sourceMappingURL=table-settings.js.map