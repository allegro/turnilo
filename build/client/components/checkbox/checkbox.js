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
require("./checkbox.scss");
var Checkbox = (function (_super) {
    __extends(Checkbox, _super);
    function Checkbox() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Checkbox.prototype.renderIcon = function () {
        var _a = this.props, selected = _a.selected, type = _a.type;
        if (!selected)
            return null;
        if (type === "check") {
            return React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/check.svg") });
        }
        else if (type === "cross") {
            return React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/x.svg") });
        }
        return null;
    };
    Checkbox.prototype.render = function () {
        var _a = this.props, onClick = _a.onClick, type = _a.type, color = _a.color, selected = _a.selected, label = _a.label, className = _a.className;
        var style = null;
        if (color) {
            style = { background: color };
        }
        return React.createElement("div", { className: dom_1.classNames("checkbox", type, className, { selected: selected, color: color }), onClick: onClick },
            React.createElement("div", { className: "checkbox-body", style: style }),
            this.renderIcon(),
            label ? React.createElement("div", { className: "label" }, label) : null);
    };
    Checkbox.defaultProps = {
        type: "check"
    };
    return Checkbox;
}(React.Component));
exports.Checkbox = Checkbox;
//# sourceMappingURL=checkbox.js.map