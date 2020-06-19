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
var stage_1 = require("../../../common/models/stage/stage");
var dom_1 = require("../../utils/dom/dom");
var bubble_menu_1 = require("../bubble-menu/bubble-menu");
var vis_selector_item_1 = require("./vis-selector-item");
var vis_selector_menu_1 = require("./vis-selector-menu");
require("./vis-selector.scss");
var visSelectorMenuStage = stage_1.Stage.fromSize(268, 176);
var VisSelector = (function (_super) {
    __extends(VisSelector, _super);
    function VisSelector() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.selector = React.createRef();
        _this.state = { openMenu: false };
        _this.openMenu = function (e) {
            var openMenu = _this.state.openMenu;
            var target = e.currentTarget;
            if (openMenu && _this.selector.current === target) {
                _this.closeMenu();
                return;
            }
            _this.setState({
                openMenu: true
            });
        };
        _this.closeMenu = function () { return _this.setState({ openMenu: false }); };
        _this.changeVisualization = function (vis, settings) { return _this.props.clicker.changeVisualization(vis, settings); };
        return _this;
    }
    VisSelector.prototype.renderMenu = function () {
        var openMenu = this.state.openMenu;
        if (!openMenu)
            return null;
        var essence = this.props.essence;
        return React.createElement(bubble_menu_1.BubbleMenu, { className: "vis-selector-menu-container", direction: "down", stage: visSelectorMenuStage, openOn: this.selector.current, onClose: this.closeMenu },
            React.createElement(vis_selector_menu_1.VisSelectorMenu, { initialVisualization: essence.visualization, initialSettings: essence.visualizationSettings, onClose: this.closeMenu, onSelect: this.changeVisualization }));
    };
    VisSelector.prototype.render = function () {
        var visualization = this.props.essence.visualization;
        var openMenu = this.state.openMenu;
        return React.createElement(React.Fragment, null,
            React.createElement("div", { ref: this.selector, className: dom_1.classNames("vis-selector", { active: openMenu }), onClick: this.openMenu },
                React.createElement(vis_selector_item_1.VisSelectorItem, { visualization: visualization, selected: true })),
            this.renderMenu());
    };
    return VisSelector;
}(React.Component));
exports.VisSelector = VisSelector;
//# sourceMappingURL=vis-selector.js.map