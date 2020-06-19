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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var filter_clause_1 = require("../../../../common/models/filter-clause/filter-clause");
var stage_1 = require("../../../../common/models/stage/stage");
var constants_1 = require("../../../config/constants");
var bubble_menu_1 = require("../../bubble-menu/bubble-menu");
var button_group_1 = require("../../button-group/button-group");
var fixed_time_tab_1 = require("./fixed-time-tab");
var preset_time_tab_1 = require("./preset-time-tab");
require("./time-filter-menu.scss");
var MENU_WIDTH = 250;
function tabTitle(tab) {
    return tab === TimeFilterTab.RELATIVE ? constants_1.STRINGS.relative : constants_1.STRINGS.fixed;
}
var TabSelector = function (props) {
    var selectedTab = props.selectedTab, onTabSelect = props.onTabSelect;
    var tabs = [TimeFilterTab.RELATIVE, TimeFilterTab.FIXED].map(function (tab) {
        return {
            isSelected: selectedTab === tab,
            title: tabTitle(tab),
            key: tab,
            onClick: function () { return onTabSelect(tab); }
        };
    });
    return React.createElement(button_group_1.ButtonGroup, { groupMembers: tabs });
};
var TimeFilterTab;
(function (TimeFilterTab) {
    TimeFilterTab["RELATIVE"] = "relative";
    TimeFilterTab["FIXED"] = "fixed";
})(TimeFilterTab || (TimeFilterTab = {}));
function initialTab(essence) {
    var isRelativeTimeFilter = essence.timeFilter() instanceof filter_clause_1.RelativeTimeFilterClause;
    return isRelativeTimeFilter ? TimeFilterTab.RELATIVE : TimeFilterTab.FIXED;
}
var TimeFilterMenu = (function (_super) {
    __extends(TimeFilterMenu, _super);
    function TimeFilterMenu() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { tab: initialTab(_this.props.essence) };
        _this.selectTab = function (tab) { return _this.setState({ tab: tab }); };
        return _this;
    }
    TimeFilterMenu.prototype.render = function () {
        var _a = this.props, essence = _a.essence, timekeeper = _a.timekeeper, clicker = _a.clicker, dimension = _a.dimension, onClose = _a.onClose, containerStage = _a.containerStage, openOn = _a.openOn, inside = _a.inside;
        if (!dimension)
            return null;
        var tab = this.state.tab;
        var menuSize = stage_1.Stage.fromSize(MENU_WIDTH, 410);
        var isRelativeTab = tab === TimeFilterTab.RELATIVE;
        var tabProps = { essence: essence, dimension: dimension, timekeeper: timekeeper, onClose: onClose, clicker: clicker };
        return React.createElement(bubble_menu_1.BubbleMenu, { className: "time-filter-menu", direction: "down", containerStage: containerStage, stage: menuSize, openOn: openOn, onClose: onClose, inside: inside },
            React.createElement(TabSelector, { selectedTab: tab, onTabSelect: this.selectTab }),
            isRelativeTab ? React.createElement(preset_time_tab_1.PresetTimeTab, __assign({}, tabProps)) : React.createElement(fixed_time_tab_1.FixedTimeTab, __assign({}, tabProps)));
    };
    return TimeFilterMenu;
}(React.Component));
exports.TimeFilterMenu = TimeFilterMenu;
//# sourceMappingURL=time-filter-menu.js.map