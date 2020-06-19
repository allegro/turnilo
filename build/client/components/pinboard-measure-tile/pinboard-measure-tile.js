"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var sort_on_1 = require("../../../common/models/sort-on/sort-on");
var functional_1 = require("../../../common/utils/functional/functional");
var dropdown_1 = require("../dropdown/dropdown");
require("./pinboard-measure-tile.scss");
var renderSelectedItem = function (item) { return item ? sort_on_1.SortOn.getTitle(item) : "---"; };
exports.PinboardMeasureTile = function (props) {
    var essence = props.essence, title = props.title, dimension = props.dimension, sortOn = props.sortOn, onSelect = props.onSelect;
    var sortOns = functional_1.concatTruthy.apply(void 0, [dimension && new sort_on_1.DimensionSortOn(dimension)].concat(essence.seriesSortOns(false).toArray()));
    return React.createElement("div", { className: "pinboard-measure-tile" },
        React.createElement("div", { className: "title" }, title),
        React.createElement(dropdown_1.Dropdown, { items: sortOns, selectedItem: sortOn, equal: sort_on_1.SortOn.equals, renderItem: sort_on_1.SortOn.getTitle, renderSelectedItem: renderSelectedItem, keyItem: sort_on_1.SortOn.getKey, onSelect: onSelect }),
        !sortOn && React.createElement("div", { className: "pinboard-sort-error" }, "No measure selected."));
};
//# sourceMappingURL=pinboard-measure-tile.js.map