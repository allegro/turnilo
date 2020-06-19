"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var searchable_folder_1 = require("../searchable-tile/searchable-folder");
var dimension_item_1 = require("./dimension-item");
var dimensions_converter_1 = require("./dimensions-converter");
var DimensionsRenderer = (function () {
    function DimensionsRenderer(dimensionClick, dimensionDragStart, searchText) {
        this.dimensionClick = dimensionClick;
        this.dimensionDragStart = dimensionDragStart;
        this.searchText = searchText;
    }
    DimensionsRenderer.prototype.render = function (children) {
        var _this = this;
        var searchText = this.searchText;
        return children
            .filter(function (child) { return !searchText || child.hasSearchText || child.type === dimensions_converter_1.DimensionForViewType.group; })
            .map(function (child) {
            if (child.type === dimensions_converter_1.DimensionForViewType.group) {
                return _this.renderFolder(child);
            }
            else {
                return _this.renderDimension(child);
            }
        });
    };
    DimensionsRenderer.prototype.renderFolder = function (groupView) {
        var searchText = this.searchText;
        var name = groupView.name, title = groupView.title, description = groupView.description, hasSearchText = groupView.hasSearchText, isFilteredOrSplit = groupView.isFilteredOrSplit, children = groupView.children;
        return React.createElement(searchable_folder_1.SearchableFolder, { key: name, name: name, title: title, description: description, inSearchMode: !!searchText, hasItemsWithSearchText: hasSearchText, shouldBeOpened: isFilteredOrSplit }, this.render(children));
    };
    DimensionsRenderer.prototype.renderDimension = function (dimensionView) {
        var _a = this, dimensionClick = _a.dimensionClick, dimensionDragStart = _a.dimensionDragStart, searchText = _a.searchText;
        var name = dimensionView.name, title = dimensionView.title, description = dimensionView.description, classSuffix = dimensionView.classSuffix, selected = dimensionView.selected;
        return React.createElement(dimension_item_1.DimensionItem, { key: name, name: name, title: title, description: description, selected: selected, dimensionClick: dimensionClick, dimensionDragStart: dimensionDragStart, classSuffix: classSuffix, searchText: searchText });
    };
    return DimensionsRenderer;
}());
exports.DimensionsRenderer = DimensionsRenderer;
//# sourceMappingURL=dimensions-renderer.js.map