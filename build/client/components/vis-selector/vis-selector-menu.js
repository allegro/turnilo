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
var visualization_manifests_1 = require("../../../common/visualization-manifests");
var constants_1 = require("../../config/constants");
var settings_component_1 = require("../../visualization-settings/settings-component");
var button_1 = require("../button/button");
var vis_selector_item_1 = require("./vis-selector-item");
require("./vis-selector-menu.scss");
var VisSelectorMenu = (function (_super) {
    __extends(VisSelectorMenu, _super);
    function VisSelectorMenu() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            visualization: _this.props.initialVisualization,
            visualizationSettings: _this.props.initialSettings
        };
        _this.save = function () {
            var _a = _this.props, onSelect = _a.onSelect, onClose = _a.onClose;
            var _b = _this.state, visualization = _b.visualization, visualizationSettings = _b.visualizationSettings;
            onSelect(visualization, visualizationSettings);
            onClose();
        };
        _this.close = function () { return _this.props.onClose(); };
        _this.changeVisualization = function (visualization) { return _this.setState({ visualization: visualization, visualizationSettings: visualization.visualizationSettings.defaults }); };
        _this.changeSettings = function (visualizationSettings) { return _this.setState({ visualizationSettings: visualizationSettings }); };
        return _this;
    }
    VisSelectorMenu.prototype.renderSettings = function () {
        var component = this.settingsComponent();
        if (!component)
            return null;
        return React.createElement("div", { className: "vis-settings" },
            React.createElement("div", { className: "vis-settings-title" }, "Settings"),
            component);
    };
    VisSelectorMenu.prototype.settingsComponent = function () {
        var _a = this.state, visualization = _a.visualization, visualizationSettings = _a.visualizationSettings;
        switch (visualization.name) {
            case "table":
                var TableSettingsComponent = settings_component_1.settingsComponent(visualization.name);
                return React.createElement(TableSettingsComponent, { onChange: this.changeSettings, settings: visualizationSettings });
            case "heatmap":
                return null;
            case "totals":
                return null;
            case "bar-chart":
                return null;
            case "line-chart":
                var LineChartSettingsComponent = settings_component_1.settingsComponent(visualization.name);
                return React.createElement(LineChartSettingsComponent, { onChange: this.changeSettings, settings: visualizationSettings });
        }
    };
    VisSelectorMenu.prototype.render = function () {
        var _this = this;
        var selected = this.state.visualization;
        return React.createElement("div", { className: "vis-selector-menu" },
            React.createElement("div", { className: "vis-items" }, visualization_manifests_1.MANIFESTS.map(function (visualization) { return React.createElement(vis_selector_item_1.VisSelectorItem, { key: visualization.name, visualization: visualization, selected: visualization.name === selected.name, onClick: _this.changeVisualization }); })),
            this.renderSettings(),
            React.createElement("div", { className: "ok-cancel-bar" },
                React.createElement(button_1.Button, { type: "primary", title: constants_1.STRINGS.ok, onClick: this.save }),
                React.createElement(button_1.Button, { type: "secondary", title: constants_1.STRINGS.cancel, onClick: this.close })));
    };
    return VisSelectorMenu;
}(React.Component));
exports.VisSelectorMenu = VisSelectorMenu;
//# sourceMappingURL=vis-selector-menu.js.map