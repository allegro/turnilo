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
var immutable_1 = require("immutable");
var React = require("react");
var filter_clause_1 = require("../../../../common/models/filter-clause/filter-clause");
var filter_1 = require("../../../../common/models/filter/filter");
var stage_1 = require("../../../../common/models/stage/stage");
var constants_1 = require("../../../config/constants");
var dom_1 = require("../../../utils/dom/dom");
var bubble_menu_1 = require("../../bubble-menu/bubble-menu");
var button_1 = require("../../button/button");
var filter_options_dropdown_1 = require("../../filter-options-dropdown/filter-options-dropdown");
var number_range_picker_1 = require("../../number-range-picker/number-range-picker");
require("./number-filter-menu.scss");
function numberOrAnyToString(start) {
    if (start === number_range_picker_1.ANY_VALUE)
        return constants_1.STRINGS.any;
    return "" + start;
}
function stringToNumberOrAny(startInput) {
    var parse = parseFloat(startInput);
    return isNaN(parse) ? number_range_picker_1.ANY_VALUE : parse;
}
var MENU_WIDTH = 250;
var filterOptions = filter_options_dropdown_1.FilterOptionsDropdown.getFilterOptions(filter_1.FilterMode.INCLUDE, filter_1.FilterMode.EXCLUDE);
var NumberFilterMenu = (function (_super) {
    __extends(NumberFilterMenu, _super);
    function NumberFilterMenu() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            leftOffset: null,
            rightBound: null,
            start: number_range_picker_1.ANY_VALUE,
            end: number_range_picker_1.ANY_VALUE
        };
        _this.globalKeyDownListener = function (e) {
            if (dom_1.enterKey(e)) {
                _this.onOkClick();
            }
        };
        _this.onOkClick = function () {
            if (!_this.actionEnabled())
                return;
            var _a = _this.props, clicker = _a.clicker, onClose = _a.onClose;
            clicker.changeFilter(_this.constructFilter());
            onClose();
        };
        _this.onCancelClick = function () {
            var onClose = _this.props.onClose;
            onClose();
        };
        _this.onRangeInputStartChange = function (e) {
            var startInput = e.target.value;
            _this.setState({
                start: stringToNumberOrAny(startInput)
            });
        };
        _this.onRangeInputEndChange = function (e) {
            var endInput = e.target.value;
            _this.setState({
                end: stringToNumberOrAny(endInput)
            });
        };
        _this.onRangeStartChange = function (start) {
            _this.setState({ start: start });
        };
        _this.onRangeEndChange = function (end) {
            _this.setState({ end: end });
        };
        _this.onSelectFilterOption = function (filterMode) {
            _this.setState({ filterMode: filterMode });
        };
        return _this;
    }
    NumberFilterMenu.prototype.componentWillMount = function () {
        var _a = this.props, essence = _a.essence, dimension = _a.dimension;
        var clause = essence.filter.getClauseForDimension(dimension);
        if (!clause)
            return;
        if (!(clause instanceof filter_clause_1.NumberFilterClause)) {
            throw new Error("Expected number filter. Got: " + clause);
        }
        var hasFilter = clause.values.count() !== 0;
        if (hasFilter) {
            var _b = clause.values.first(), start = _b.start, end = _b.end;
            this.setState({
                start: start,
                end: end,
                filterMode: essence.filter.getModeForDimension(dimension) || filter_1.FilterMode.INCLUDE
            });
        }
    };
    NumberFilterMenu.prototype.componentDidMount = function () {
        window.addEventListener("keydown", this.globalKeyDownListener);
    };
    NumberFilterMenu.prototype.componentWillUnmount = function () {
        window.removeEventListener("keydown", this.globalKeyDownListener);
    };
    NumberFilterMenu.prototype.constructFilter = function () {
        var _a = this.props, filter = _a.essence.filter, dimension = _a.dimension;
        var _b = this.state, start = _b.start, end = _b.end, filterMode = _b.filterMode;
        if (isNaN(start) || isNaN(end))
            return null;
        if (start === null && end === null)
            return null;
        if (start !== null && end !== null && start > end)
            return null;
        return filter.setClause(new filter_clause_1.NumberFilterClause({
            reference: dimension.name,
            not: filterMode === filter_1.FilterMode.EXCLUDE,
            values: immutable_1.List.of(new filter_clause_1.NumberRange({ start: start, end: end, bounds: start === end ? "[]" : "[)" }))
        }));
    };
    NumberFilterMenu.prototype.actionEnabled = function () {
        var essence = this.props.essence;
        var filter = this.constructFilter();
        return Boolean(filter) && !essence.filter.equals(filter);
    };
    NumberFilterMenu.prototype.render = function () {
        var _a = this.props, essence = _a.essence, timekeeper = _a.timekeeper, dimension = _a.dimension, onClose = _a.onClose, containerStage = _a.containerStage, openOn = _a.openOn, inside = _a.inside;
        var _b = this.state, end = _b.end, start = _b.start, filterMode = _b.filterMode;
        var menuSize = stage_1.Stage.fromSize(MENU_WIDTH, 410);
        return React.createElement(bubble_menu_1.BubbleMenu, { className: "number-filter-menu", direction: "down", containerStage: containerStage, stage: menuSize, openOn: openOn, onClose: onClose, inside: inside },
            React.createElement("div", { className: "side-by-side" },
                React.createElement("div", { className: "group" },
                    React.createElement("label", { className: "input-top-label" }, "Type"),
                    React.createElement(filter_options_dropdown_1.FilterOptionsDropdown, { selectedOption: filterMode, onSelectOption: this.onSelectFilterOption, filterOptions: filterOptions })),
                React.createElement("div", { className: "group" },
                    React.createElement("label", { className: "input-top-label" }, "Min"),
                    React.createElement("input", { value: numberOrAnyToString(start), onChange: this.onRangeInputStartChange })),
                React.createElement("div", { className: "group" },
                    React.createElement("label", { className: "input-top-label" }, "Max"),
                    React.createElement("input", { value: numberOrAnyToString(end), onChange: this.onRangeInputEndChange }))),
            React.createElement(number_range_picker_1.NumberRangePicker, { onRangeEndChange: this.onRangeEndChange, onRangeStartChange: this.onRangeStartChange, start: start, end: end, dimension: dimension, essence: essence, timekeeper: timekeeper, exclude: filterMode === filter_1.FilterMode.EXCLUDE }),
            React.createElement("div", { className: "ok-cancel-bar" },
                React.createElement(button_1.Button, { type: "primary", title: constants_1.STRINGS.ok, onClick: this.onOkClick, disabled: !this.actionEnabled() }),
                React.createElement(button_1.Button, { type: "secondary", title: constants_1.STRINGS.cancel, onClick: this.onCancelClick })));
    };
    return NumberFilterMenu;
}(React.Component));
exports.NumberFilterMenu = NumberFilterMenu;
//# sourceMappingURL=number-filter-menu.js.map