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
var filter_1 = require("../../../common/models/filter/filter");
var constants_1 = require("../../config/constants");
var dropdown_1 = require("../dropdown/dropdown");
var svg_icon_1 = require("../svg-icon/svg-icon");
require("./filter-options-dropdown.scss");
var FILTER_OPTIONS = [
    {
        label: constants_1.STRINGS.include,
        value: filter_1.FilterMode.INCLUDE,
        svg: require("../../icons/filter-include.svg"),
        checkType: "check"
    },
    {
        label: constants_1.STRINGS.exclude,
        value: filter_1.FilterMode.EXCLUDE,
        svg: require("../../icons/filter-exclude.svg"),
        checkType: "cross"
    },
    {
        label: constants_1.STRINGS.contains,
        value: filter_1.FilterMode.CONTAINS,
        svg: require("../../icons/filter-contains.svg")
    },
    {
        label: constants_1.STRINGS.regex,
        value: filter_1.FilterMode.REGEX,
        svg: require("../../icons/filter-regex.svg")
    }
];
var FilterOptionsDropdown = (function (_super) {
    __extends(FilterOptionsDropdown, _super);
    function FilterOptionsDropdown() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onSelectOption = function (option) {
            _this.props.onSelectOption(option.value);
        };
        _this.renderFilterOption = function (option) {
            return React.createElement("span", { className: "filter-option" },
                React.createElement(svg_icon_1.SvgIcon, { className: "icon", svg: option.svg }),
                React.createElement("span", { className: "option-label" }, option.label));
        };
        return _this;
    }
    FilterOptionsDropdown.getFilterOptions = function () {
        var filterTypes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            filterTypes[_i] = arguments[_i];
        }
        return FILTER_OPTIONS.filter(function (option) { return filterTypes.indexOf(option.value) !== -1; });
    };
    FilterOptionsDropdown.prototype.render = function () {
        var _a = this.props, selectedOption = _a.selectedOption, _b = _a.filterOptions, filterOptions = _b === void 0 ? FILTER_OPTIONS : _b;
        var selectedItem = filterOptions.find(function (_a) {
            var value = _a.value;
            return value === selectedOption;
        }) || filterOptions[0];
        return React.createElement("div", { className: "filter-options-dropdown" },
            React.createElement(dropdown_1.Dropdown, { menuClassName: "filter-options", items: filterOptions, selectedItem: selectedItem, equal: function (a, b) { return a.value === b.value; }, keyItem: function (d) { return d.value; }, renderItem: this.renderFilterOption, renderSelectedItem: function (d) { return React.createElement(svg_icon_1.SvgIcon, { className: "icon", svg: d.svg }); }, onSelect: this.onSelectOption }));
    };
    return FilterOptionsDropdown;
}(React.Component));
exports.FilterOptionsDropdown = FilterOptionsDropdown;
//# sourceMappingURL=filter-options-dropdown.js.map