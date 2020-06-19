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
var react_1 = require("react");
var constants_1 = require("../../config/constants");
var dom_1 = require("../../utils/dom/dom");
var drag_manager_1 = require("../../utils/drag-manager/drag-manager");
var dimension_actions_menu_1 = require("../dimension-actions-menu/dimension-actions-menu");
var searchable_tile_1 = require("../searchable-tile/searchable-tile");
var dimension_item_1 = require("./dimension-item");
require("./dimension-list-tile.scss");
var dimensions_converter_1 = require("./dimensions-converter");
var dimensions_renderer_1 = require("./dimensions-renderer");
var hasSearchTextPredicate = function (searchText) { return function (dimension) {
    return dimension.title.toLowerCase().includes(searchText.toLowerCase());
}; };
var isFilteredOrSplitPredicate = function (essence) { return function (dimension) {
    var dataCube = essence.dataCube, filter = essence.filter, splits = essence.splits;
    return isFiltered(dimension, filter, dataCube) || isSplit(dimension, splits, dataCube);
}; };
var isSplit = function (dimension, _a, dataCube) {
    var splits = _a.splits;
    return splits
        .map(function (split) { return dataCube.dimensions.getDimensionByName(split.reference); })
        .contains(dimension);
};
var isFiltered = function (dimension, filter, dataCube) {
    return filter
        .clauses
        .map(function (clause) { return dataCube.dimensions.getDimensionByName(clause.reference); })
        .contains(dimension);
};
var isSelectedDimensionPredicate = function (menuDimension) { return function (dimension) {
    return menuDimension === dimension;
}; };
var DimensionListTile = (function (_super) {
    __extends(DimensionListTile, _super);
    function DimensionListTile() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            menuOpenOn: null,
            menuDimension: null,
            showSearch: false,
            searchText: ""
        };
        _this.clickDimension = function (dimensionName, e) {
            var menuOpenOn = _this.state.menuOpenOn;
            var target = dom_1.findParentWithClass(e.currentTarget, dimension_item_1.DIMENSION_CLASS_NAME);
            if (menuOpenOn === target) {
                _this.closeMenu();
                return;
            }
            var dataCube = _this.props.essence.dataCube;
            var dimension = dataCube.dimensions.getDimensionByName(dimensionName);
            _this.setState({
                menuOpenOn: target,
                menuDimension: dimension
            });
        };
        _this.closeMenu = function () {
            var menuOpenOn = _this.state.menuOpenOn;
            if (!menuOpenOn)
                return;
            _this.setState({
                menuOpenOn: null,
                menuDimension: null
            });
        };
        _this.dragStart = function (dimensionName, e) {
            var dataCube = _this.props.essence.dataCube;
            var dimension = dataCube.dimensions.getDimensionByName(dimensionName);
            var dataTransfer = e.dataTransfer;
            dataTransfer.effectAllowed = "all";
            dom_1.setDragData(dataTransfer, "text/plain", dimension.title);
            drag_manager_1.DragManager.setDragDimension(dimension);
            dom_1.setDragGhost(dataTransfer, dimension.title);
            _this.closeMenu();
        };
        _this.toggleSearch = function () {
            _this.setState(function (_a) {
                var showSearch = _a.showSearch;
                return ({ showSearch: !showSearch });
            });
            _this.onSearchChange("");
        };
        _this.onSearchChange = function (text) {
            var searchText = _this.state.searchText;
            var newSearchText = text.substr(0, constants_1.MAX_SEARCH_LENGTH);
            if (searchText === newSearchText)
                return;
            _this.setState({
                searchText: newSearchText
            });
        };
        return _this;
    }
    DimensionListTile.prototype.renderMenu = function () {
        var _a = this.props, essence = _a.essence, clicker = _a.clicker, menuStage = _a.menuStage, triggerFilterMenu = _a.triggerFilterMenu;
        var _b = this.state, menuOpenOn = _b.menuOpenOn, menuDimension = _b.menuDimension;
        if (!menuDimension)
            return null;
        return React.createElement(dimension_actions_menu_1.DimensionActionsMenu, { clicker: clicker, essence: essence, direction: "right", containerStage: menuStage, openOn: menuOpenOn, dimension: menuDimension, triggerFilterMenu: triggerFilterMenu, onClose: this.closeMenu });
    };
    DimensionListTile.prototype.renderMessageIfNoDimensionsFound = function (dimensionsForView) {
        var searchText = this.state.searchText;
        if (!!searchText && !dimensionsForView.some(function (dimension) { return dimension.hasSearchText; })) {
            var noDimensionsFound = "No dimensions for \"" + searchText + "\"";
            return React.createElement("div", { className: "message" }, noDimensionsFound);
        }
        else {
            return null;
        }
    };
    DimensionListTile.prototype.render = function () {
        var _a = this.props, essence = _a.essence, style = _a.style;
        var _b = this.state, menuDimension = _b.menuDimension, showSearch = _b.showSearch, searchText = _b.searchText;
        var dataCube = essence.dataCube;
        var dimensionsConverter = new dimensions_converter_1.DimensionsConverter(hasSearchTextPredicate(searchText), isFilteredOrSplitPredicate(essence), isSelectedDimensionPredicate(menuDimension));
        var dimensionsForView = dataCube.dimensions.accept(dimensionsConverter);
        var dimensionsRenderer = new dimensions_renderer_1.DimensionsRenderer(this.clickDimension, this.dragStart, searchText);
        var items = dimensionsRenderer.render(dimensionsForView);
        var message = this.renderMessageIfNoDimensionsFound(dimensionsForView);
        var icons = [
            {
                name: "search",
                ref: "search",
                onClick: this.toggleSearch,
                svg: require("../../icons/full-search.svg"),
                active: showSearch
            }
        ];
        return React.createElement(searchable_tile_1.SearchableTile, { style: style, title: constants_1.STRINGS.dimensions, toggleChangeFn: this.toggleSearch, onSearchChange: this.onSearchChange, searchText: searchText, showSearch: showSearch, icons: icons, className: "dimension-list-tile" },
            React.createElement("div", { className: "rows", ref: "items" },
                items,
                message),
            this.renderMenu());
    };
    return DimensionListTile;
}(react_1.Component));
exports.DimensionListTile = DimensionListTile;
//# sourceMappingURL=dimension-list-tile.js.map