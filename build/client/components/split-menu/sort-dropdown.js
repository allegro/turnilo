"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var sort_on_1 = require("../../../common/models/sort-on/sort-on");
var sort_1 = require("../../../common/models/sort/sort");
var constants_1 = require("../../config/constants");
var dropdown_1 = require("../dropdown/dropdown");
var svg_icon_1 = require("../svg-icon/svg-icon");
exports.SortDropdown = function (_a) {
    var direction = _a.direction, options = _a.options, selected = _a.selected, onChange = _a.onChange;
    function toggleDirection() {
        var newDirection = direction === sort_1.SortDirection.descending ? sort_1.SortDirection.ascending : sort_1.SortDirection.descending;
        onChange(selected.toSort(newDirection));
    }
    function selectSort(sortOn) {
        onChange(sortOn.toSort(direction));
    }
    return React.createElement("div", { className: "sort-direction" },
        React.createElement(dropdown_1.Dropdown, { label: constants_1.STRINGS.sortBy, items: options, selectedItem: selected, equal: sort_on_1.SortOn.equals, renderItem: sort_on_1.SortOn.getTitle, keyItem: sort_on_1.SortOn.getKey, onSelect: selectSort }),
        React.createElement("div", { className: "direction " + direction, onClick: toggleDirection },
            React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/sort-arrow.svg") })));
};
//# sourceMappingURL=sort-dropdown.js.map