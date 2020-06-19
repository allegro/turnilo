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
var filter_1 = require("../../../../common/models/filter/filter");
var stage_1 = require("../../../../common/models/stage/stage");
var bubble_menu_1 = require("../../bubble-menu/bubble-menu");
var filter_options_dropdown_1 = require("../../filter-options-dropdown/filter-options-dropdown");
var preview_string_filter_menu_1 = require("../../preview-string-filter-menu/preview-string-filter-menu");
var selectable_string_filter_menu_1 = require("../../selectable-string-filter-menu/selectable-string-filter-menu");
require("./string-filter-menu.scss");
var StringFilterMenu = (function (_super) {
    __extends(StringFilterMenu, _super);
    function StringFilterMenu() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.initialFilterMode = function () {
            var _a = _this.props, filter = _a.essence.filter, dimension = _a.dimension;
            var filterMode = filter.getModeForDimension(dimension);
            return filterMode || filter_1.FilterMode.INCLUDE;
        };
        _this.state = { filterMode: _this.initialFilterMode() };
        _this.onSelectFilterOption = function (filterMode) { return _this.setState({ filterMode: filterMode }); };
        _this.updateFilter = function (clause) {
            var _a = _this.props, essence = _a.essence, dimension = _a.dimension, changePosition = _a.changePosition;
            var filter = essence.filter;
            if (!clause)
                return filter.removeClause(dimension.name);
            if (changePosition) {
                if (changePosition.isInsert()) {
                    return filter.insertByIndex(changePosition.insert, clause);
                }
                else {
                    return filter.replaceByIndex(changePosition.replace, clause);
                }
            }
            else {
                return filter.setClause(clause);
            }
        };
        return _this;
    }
    StringFilterMenu.prototype.getFilterOptions = function () {
        var dimension = this.props.dimension;
        var dimensionKind = dimension.kind;
        var filterOptions = filter_options_dropdown_1.FilterOptionsDropdown.getFilterOptions(filter_1.FilterMode.INCLUDE, filter_1.FilterMode.EXCLUDE);
        if (dimensionKind !== "boolean")
            filterOptions = filterOptions.concat(filter_options_dropdown_1.FilterOptionsDropdown.getFilterOptions(filter_1.FilterMode.REGEX, filter_1.FilterMode.CONTAINS));
        return filterOptions;
    };
    StringFilterMenu.prototype.renderFilterControls = function () {
        var _a = this.props, dimension = _a.dimension, clicker = _a.clicker, essence = _a.essence, timekeeper = _a.timekeeper, onClose = _a.onClose;
        var filterMode = this.state.filterMode;
        var onClauseChange = this.updateFilter;
        var props = { dimension: dimension, clicker: clicker, essence: essence, timekeeper: timekeeper, onClose: onClose, onClauseChange: onClauseChange };
        switch (filterMode) {
            case filter_1.FilterMode.EXCLUDE:
            case filter_1.FilterMode.INCLUDE:
                var selectableProps = __assign({}, props, { filterMode: filterMode });
                return React.createElement(selectable_string_filter_menu_1.SelectableStringFilterMenu, __assign({}, selectableProps));
            case filter_1.FilterMode.REGEX:
            case filter_1.FilterMode.CONTAINS:
                var previewProps = __assign({}, props, { filterMode: filterMode });
                return React.createElement(preview_string_filter_menu_1.PreviewStringFilterMenu, __assign({ key: filterMode }, previewProps));
        }
    };
    StringFilterMenu.prototype.render = function () {
        var _a = this.props, dimension = _a.dimension, onClose = _a.onClose, containerStage = _a.containerStage, openOn = _a.openOn, inside = _a.inside;
        var filterMode = this.state.filterMode;
        if (!dimension)
            return null;
        return React.createElement(bubble_menu_1.BubbleMenu, { className: "string-filter-menu", direction: "down", containerStage: containerStage, stage: stage_1.Stage.fromSize(300, 410), openOn: openOn, onClose: onClose, inside: inside },
            React.createElement("div", { className: "string-filter-content" },
                React.createElement(filter_options_dropdown_1.FilterOptionsDropdown, { selectedOption: filterMode, onSelectOption: this.onSelectFilterOption, filterOptions: this.getFilterOptions() }),
                this.renderFilterControls()));
    };
    return StringFilterMenu;
}(React.Component));
exports.StringFilterMenu = StringFilterMenu;
//# sourceMappingURL=string-filter-menu.js.map