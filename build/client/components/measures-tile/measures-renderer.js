"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var searchable_folder_1 = require("../searchable-tile/searchable-folder");
var measure_item_1 = require("./measure-item");
var measures_converter_1 = require("./measures-converter");
var MeasuresRenderer = (function () {
    function MeasuresRenderer(measureClick, measureDragStart, searchText) {
        this.measureClick = measureClick;
        this.measureDragStart = measureDragStart;
        this.searchText = searchText;
    }
    MeasuresRenderer.prototype.render = function (children) {
        var _this = this;
        var searchText = this.searchText;
        var notInSearchModeOrHasSearchTextOrIsGroup = function (item) {
            return !searchText || item.hasSearchText || item.type === measures_converter_1.MeasureForViewType.group;
        };
        return children
            .filter(notInSearchModeOrHasSearchTextOrIsGroup)
            .map(function (child) {
            if (child.type === measures_converter_1.MeasureForViewType.group) {
                return _this.renderFolder(child);
            }
            else {
                return _this.renderMeasure(child);
            }
        });
    };
    MeasuresRenderer.prototype.renderFolder = function (groupView) {
        var searchText = this.searchText;
        var name = groupView.name, title = groupView.title, description = groupView.description, hasSearchText = groupView.hasSearchText, hasSelectedMeasures = groupView.hasSelectedMeasures, children = groupView.children;
        return React.createElement(searchable_folder_1.SearchableFolder, { key: name, name: name, description: description, title: title, inSearchMode: !!searchText, hasItemsWithSearchText: hasSearchText, shouldBeOpened: hasSelectedMeasures }, this.render(children));
    };
    MeasuresRenderer.prototype.renderMeasure = function (measureView) {
        var _a = this, measureClick = _a.measureClick, measureDragStart = _a.measureDragStart, searchText = _a.searchText;
        var name = measureView.name, title = measureView.title, approximate = measureView.approximate, description = measureView.description, hasSelectedMeasures = measureView.hasSelectedMeasures;
        return React.createElement(measure_item_1.MeasureItem, { key: name, name: name, title: title, description: description, approximate: approximate, selected: hasSelectedMeasures, measureClick: measureClick, measureDragStart: measureDragStart, searchText: searchText });
    };
    return MeasuresRenderer;
}());
exports.MeasuresRenderer = MeasuresRenderer;
//# sourceMappingURL=measures-renderer.js.map