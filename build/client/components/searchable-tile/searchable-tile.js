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
var ReactDOM = require("react-dom");
var stage_1 = require("../../../common/models/stage/stage");
var dom_1 = require("../../utils/dom/dom");
var bubble_menu_1 = require("../bubble-menu/bubble-menu");
var clearable_input_1 = require("../clearable-input/clearable-input");
var tile_header_1 = require("../tile-header/tile-header");
require("./searchable-tile.scss");
var SearchableTile = (function (_super) {
    __extends(SearchableTile, _super);
    function SearchableTile() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            actionsMenuOpenOn: null
        };
        _this.globalMouseDownListener = function (e) {
            var _a = _this.props, searchText = _a.searchText, toggleChangeFn = _a.toggleChangeFn;
            if (searchText !== "")
                return;
            var target = e.target;
            var searchBoxElement = ReactDOM.findDOMNode(_this.refs["search-box"]);
            if (!searchBoxElement || dom_1.isInside(target, searchBoxElement))
                return;
            var headerRef = _this.refs["header"];
            if (!headerRef || headerRef instanceof Element)
                return;
            var searchButtonElement = ReactDOM.findDOMNode(headerRef.refs["search"]);
            if (!searchButtonElement || dom_1.isInside(target, searchButtonElement))
                return;
            toggleChangeFn();
        };
        _this.globalKeyDownListener = function (e) {
            var _a = _this.props, toggleChangeFn = _a.toggleChangeFn, showSearch = _a.showSearch;
            if (!dom_1.escapeKey(e))
                return;
            if (!showSearch)
                return;
            toggleChangeFn();
        };
        _this.onActionsMenuClose = function () {
            var actionsMenuOpenOn = _this.state.actionsMenuOpenOn;
            if (!actionsMenuOpenOn)
                return;
            _this.setState({
                actionsMenuOpenOn: null
            });
        };
        _this.onActionsMenuClick = function (e) {
            var actionsMenuOpenOn = _this.state.actionsMenuOpenOn;
            if (actionsMenuOpenOn)
                return _this.onActionsMenuClose();
            _this.setState({
                actionsMenuOpenOn: e.target
            });
        };
        return _this;
    }
    SearchableTile.prototype.componentDidMount = function () {
        this.mounted = true;
        this.setState({ actionsMenuAlignOn: ReactDOM.findDOMNode(this.refs["header"]) });
        window.addEventListener("mousedown", this.globalMouseDownListener);
        window.addEventListener("keydown", this.globalKeyDownListener);
    };
    SearchableTile.prototype.componentWillUnmount = function () {
        this.mounted = false;
        window.removeEventListener("mousedown", this.globalMouseDownListener);
        window.removeEventListener("keydown", this.globalKeyDownListener);
    };
    SearchableTile.prototype.onSelectGranularity = function (action) {
        this.onActionsMenuClose();
        action.onSelect();
    };
    SearchableTile.prototype.renderGranularityElements = function () {
        var _this = this;
        var actions = this.props.actions;
        return actions.map(function (action) {
            return React.createElement("li", { className: dom_1.classNames({ selected: action.selected }), key: action.keyString || action.toString(), onClick: _this.onSelectGranularity.bind(_this, action) }, action.displayValue || action.toString());
        });
    };
    SearchableTile.prototype.renderActionsMenu = function () {
        var _a = this.state, actionsMenuOpenOn = _a.actionsMenuOpenOn, actionsMenuAlignOn = _a.actionsMenuAlignOn;
        var stage = stage_1.Stage.fromSize(180, 200);
        return React.createElement(bubble_menu_1.BubbleMenu, { align: "end", className: "dimension-tile-actions", direction: "down", stage: stage, onClose: this.onActionsMenuClose, openOn: actionsMenuOpenOn, alignOn: actionsMenuAlignOn },
            React.createElement("ul", { className: "bubble-list" }, this.renderGranularityElements()));
    };
    SearchableTile.prototype.render = function () {
        var _a = this.props, className = _a.className, style = _a.style, icons = _a.icons, title = _a.title, onSearchChange = _a.onSearchChange, showSearch = _a.showSearch, searchText = _a.searchText, children = _a.children, onDragStart = _a.onDragStart, actions = _a.actions;
        var actionsMenuOpenOn = this.state.actionsMenuOpenOn;
        var tileIcons = icons;
        if (actions && actions.length > 0) {
            tileIcons = [{
                    name: "more",
                    ref: "more",
                    onClick: this.onActionsMenuClick,
                    svg: require("../../icons/full-more.svg"),
                    active: Boolean(actionsMenuOpenOn)
                }].concat(icons);
        }
        var qualifiedClassName = "searchable-tile " + className;
        var header = React.createElement(tile_header_1.TileHeader, { title: title, ref: "header", icons: tileIcons, onDragStart: onDragStart });
        var searchBar = null;
        if (showSearch) {
            searchBar = React.createElement("div", { className: "search-box", ref: "search-box" },
                React.createElement(clearable_input_1.ClearableInput, { placeholder: "Search", focusOnMount: true, value: searchText, onChange: onSearchChange }));
        }
        qualifiedClassName = dom_1.classNames(qualifiedClassName, (showSearch ? "has-search" : "no-search"));
        return React.createElement("div", { className: qualifiedClassName, style: style },
            header,
            searchBar,
            actionsMenuOpenOn ? this.renderActionsMenu() : null,
            children);
    };
    return SearchableTile;
}(React.Component));
exports.SearchableTile = SearchableTile;
//# sourceMappingURL=searchable-tile.js.map