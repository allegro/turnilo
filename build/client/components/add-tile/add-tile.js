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
var stage_1 = require("../../../common/models/stage/stage");
var bubble_menu_1 = require("../bubble-menu/bubble-menu");
var clearable_input_1 = require("../clearable-input/clearable-input");
var highlight_string_1 = require("../highlight-string/highlight-string");
var svg_icon_1 = require("../svg-icon/svg-icon");
require("./add-tile.scss");
var AddTile = (function (_super) {
    __extends(AddTile, _super);
    function AddTile() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { openMenu: false, query: "" };
        _this.menuOpenOn = null;
        _this.mountAdd = function (addButton) {
            _this.menuOpenOn = addButton;
        };
        _this.closeMenu = function () { return _this.setState({ openMenu: false }); };
        _this.openMenu = function () { return _this.setState({ openMenu: true }); };
        _this.setQuery = function (query) { return _this.setState({ query: query }); };
        _this.resetQuery = function () { return _this.setQuery(""); };
        _this.selectTile = function (value) {
            _this.props.onSelect(value);
            _this.resetQuery();
            _this.closeMenu();
        };
        return _this;
    }
    AddTile.prototype.renderRows = function (rows) {
        var _this = this;
        var query = this.state.query;
        return rows.map(function (_a) {
            var value = _a.value, key = _a.key, label = _a.label;
            return React.createElement("div", { className: "tile-row", key: key, onClick: function () { return _this.selectTile(value); } },
                React.createElement(highlight_string_1.HighlightString, { className: "label", text: label, highlight: query }));
        });
    };
    AddTile.prototype.renderTable = function () {
        var tiles = this.props.tiles;
        var query = this.state.query;
        if (query.length === 0)
            return this.renderRows(tiles);
        var filteredRows = tiles.filter(function (_a) {
            var label = _a.label;
            return label.toLowerCase().includes(query.toLowerCase());
        });
        if (filteredRows.length > 0)
            return this.renderRows(filteredRows);
        return React.createElement("div", { className: "tile-row no-results" },
            "No results for ",
            query);
    };
    AddTile.prototype.renderMenu = function () {
        var containerStage = this.props.containerStage;
        var _a = this.state, openMenu = _a.openMenu, query = _a.query;
        if (!openMenu)
            return null;
        return React.createElement(bubble_menu_1.BubbleMenu, { className: "add-tile-menu", direction: "down", stage: stage_1.Stage.fromSize(250, 410), containerStage: containerStage, openOn: this.menuOpenOn, onClose: this.closeMenu },
            React.createElement("div", { className: "search-box" },
                React.createElement(clearable_input_1.ClearableInput, { placeholder: "Search", focusOnMount: true, value: query, onChange: this.setQuery })),
            React.createElement("div", { className: "tile-rows" }, this.renderTable()));
    };
    AddTile.prototype.render = function () {
        return React.createElement("div", { className: "add-tile" },
            React.createElement("div", { className: "add-button", ref: this.mountAdd, onClick: this.openMenu },
                React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/preview-subsplit.svg") })),
            this.renderMenu());
    };
    return AddTile;
}(React.Component));
exports.AddTile = AddTile;
//# sourceMappingURL=add-tile.js.map