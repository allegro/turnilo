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
var measure_actions_menu_1 = require("../measure-actions-menu/measure-actions-menu");
var searchable_tile_1 = require("../searchable-tile/searchable-tile");
var measure_item_1 = require("./measure-item");
var measures_converter_1 = require("./measures-converter");
var measures_renderer_1 = require("./measures-renderer");
var hasSearchTextPredicate = function (searchText) { return function (measure) {
    return searchText != null && searchText !== "" && measure.title.toLowerCase().includes(searchText.toLowerCase());
}; };
var isSelectedMeasurePredicate = function (seriesList) { return function (measure) {
    return seriesList.hasMeasure(measure);
}; };
var MeasuresTile = (function (_super) {
    __extends(MeasuresTile, _super);
    function MeasuresTile() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            showSearch: false,
            searchText: "",
            menuOpenOn: null,
            menuMeasure: null
        };
        _this.measureClick = function (measureName, e) {
            var menuOpenOn = _this.state.menuOpenOn;
            var target = dom_1.findParentWithClass(e.target, measure_item_1.MEASURE_CLASS_NAME);
            if (menuOpenOn === target) {
                _this.closeMenu();
                return;
            }
            var dataCube = _this.props.essence.dataCube;
            var measure = dataCube.measures.getMeasureByName(measureName);
            _this.setState({
                menuOpenOn: target,
                menuMeasure: measure
            });
        };
        _this.closeMenu = function () {
            var menuOpenOn = _this.state.menuOpenOn;
            if (!menuOpenOn)
                return;
            _this.setState({
                menuOpenOn: null,
                menuMeasure: null
            });
        };
        _this.dragStart = function (measureName, e) {
            var dataCube = _this.props.essence.dataCube;
            var measure = dataCube.getMeasure(measureName);
            var dataTransfer = e.dataTransfer;
            dataTransfer.effectAllowed = "all";
            dom_1.setDragData(dataTransfer, "text/plain", measure.title);
            drag_manager_1.DragManager.setDragMeasure(measure);
            dom_1.setDragGhost(dataTransfer, measure.title);
        };
        _this.toggleSearch = function () {
            var showSearch = _this.state.showSearch;
            _this.setState({ showSearch: !showSearch });
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
        _this.addSeries = function (series) {
            var clicker = _this.props.clicker;
            clicker.addSeries(series);
        };
        return _this;
    }
    MeasuresTile.prototype.renderMessageIfNoMeasuresFound = function (measuresForView) {
        var searchText = this.state.searchText;
        if (!searchText || measuresForView.some(function (measure) { return measure.hasSearchText; }))
            return null;
        var noMeasuresFound = "No measures for \"" + searchText + "\"";
        return React.createElement("div", { className: "message" }, noMeasuresFound);
    };
    MeasuresTile.prototype.render = function () {
        var _a = this.props, essence = _a.essence, style = _a.style;
        var _b = this.state, showSearch = _b.showSearch, searchText = _b.searchText;
        var dataCube = essence.dataCube;
        var measuresConverter = new measures_converter_1.MeasuresConverter(hasSearchTextPredicate(searchText), isSelectedMeasurePredicate(essence.series));
        var measuresForView = dataCube.measures.accept(measuresConverter);
        var measuresRenderer = new measures_renderer_1.MeasuresRenderer(this.measureClick, this.dragStart, searchText);
        var rows = measuresRenderer.render(measuresForView);
        var message = this.renderMessageIfNoMeasuresFound(measuresForView);
        var icons = [{
                name: "search",
                ref: "search",
                onClick: this.toggleSearch,
                svg: require("../../icons/full-search.svg"),
                active: showSearch
            }];
        return React.createElement(searchable_tile_1.SearchableTile, { style: style, title: constants_1.STRINGS.measures, toggleChangeFn: this.toggleSearch, onSearchChange: this.onSearchChange, searchText: searchText, showSearch: showSearch, icons: icons, className: "measures-tile" },
            React.createElement("div", { className: "rows" },
                rows,
                message),
            this.renderMenu());
    };
    MeasuresTile.prototype.renderMenu = function () {
        var _a = this.props, essence = _a.essence, appendDirtySeries = _a.appendDirtySeries, menuStage = _a.menuStage;
        var _b = this.state, menuOpenOn = _b.menuOpenOn, menuMeasure = _b.menuMeasure;
        if (!menuMeasure)
            return null;
        return React.createElement(measure_actions_menu_1.MeasureActionsMenu, { appendDirtySeries: appendDirtySeries, addSeries: this.addSeries, series: essence.series, direction: "right", containerStage: menuStage, openOn: menuOpenOn, measure: menuMeasure, onClose: this.closeMenu });
    };
    return MeasuresTile;
}(react_1.Component));
exports.MeasuresTile = MeasuresTile;
//# sourceMappingURL=measures-tile.js.map