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
var dom_1 = require("../../utils/dom/dom");
var info_bubble_1 = require("../info-bubble/info-bubble");
var svg_icon_1 = require("../svg-icon/svg-icon");
require("./searchable-folder.scss");
var SearchableFolder = (function (_super) {
    __extends(SearchableFolder, _super);
    function SearchableFolder(props) {
        var _this = _super.call(this, props) || this;
        _this.openIcon = React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/full-caret-small-bottom.svg") });
        _this.closedIcon = React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/full-caret-small-right.svg") });
        _this.handleClick = function () {
            _this.setState(function (prevState) { return ({ opened: !prevState.opened }); });
        };
        var _a = _this.props, inSearchMode = _a.inSearchMode, hasItemsWithSearchText = _a.hasItemsWithSearchText, shouldBeOpened = _a.shouldBeOpened;
        _this.state = { opened: inSearchMode && hasItemsWithSearchText || shouldBeOpened };
        return _this;
    }
    SearchableFolder.prototype.componentWillReceiveProps = function (nextProps) {
        var opened = this.state.opened;
        var shouldBeOpened = this.props.shouldBeOpened;
        var shouldOpen = !opened && !shouldBeOpened && nextProps.shouldBeOpened;
        if (shouldOpen) {
            this.setState({ opened: shouldOpen });
        }
    };
    SearchableFolder.prototype.render = function () {
        var _a = this.props, title = _a.title, description = _a.description, inSearchMode = _a.inSearchMode, hasItemsWithSearchText = _a.hasItemsWithSearchText, children = _a.children;
        var opened = this.state.opened;
        var isGroupOpen = opened || inSearchMode && hasItemsWithSearchText;
        var hidden = inSearchMode && !hasItemsWithSearchText;
        return React.createElement("div", { className: dom_1.classNames("folder", { hidden: hidden }) },
            React.createElement("div", { className: "folder-header" },
                React.createElement("div", { className: "icon-label-container", onClick: this.handleClick },
                    React.createElement("div", { className: "folder-icon" }, isGroupOpen ? this.openIcon : this.closedIcon),
                    React.createElement("span", { className: "label" }, title)),
                description && React.createElement(info_bubble_1.InfoBubble, { className: "info-icon", description: description })),
            React.createElement("div", { className: dom_1.classNames("folder-items", { closed: !isGroupOpen }) }, children));
    };
    return SearchableFolder;
}(react_1.PureComponent));
exports.SearchableFolder = SearchableFolder;
//# sourceMappingURL=searchable-folder.js.map