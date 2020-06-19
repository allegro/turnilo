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
var dom_1 = require("../../utils/dom/dom");
var svg_icon_1 = require("../svg-icon/svg-icon");
require("./tile-header.scss");
var TileHeader = (function (_super) {
    __extends(TileHeader, _super);
    function TileHeader() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TileHeader.prototype.renderIcons = function () {
        var icons = this.props.icons;
        if (!icons || !icons.length)
            return null;
        var iconElements = icons.map(function (icon) {
            return React.createElement("div", { className: dom_1.classNames("icon", icon.name, { active: icon.active }), key: icon.name, onClick: icon.onClick, ref: icon.ref },
                React.createElement(svg_icon_1.SvgIcon, { svg: icon.svg }));
        });
        return React.createElement("div", { className: "icons" }, iconElements);
    };
    TileHeader.prototype.render = function () {
        var _a = this.props, title = _a.title, onDragStart = _a.onDragStart;
        return React.createElement("div", { className: "tile-header", draggable: onDragStart ? true : null, onDragStart: onDragStart },
            React.createElement("div", { className: "title" }, title),
            this.renderIcons());
    };
    return TileHeader;
}(React.Component));
exports.TileHeader = TileHeader;
//# sourceMappingURL=tile-header.js.map