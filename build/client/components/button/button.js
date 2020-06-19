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
require("./button.scss");
var Button = (function (_super) {
    __extends(Button, _super);
    function Button() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Button.prototype.render = function () {
        var _a = this.props, title = _a.title, type = _a.type, className = _a.className, svg = _a.svg, active = _a.active, disabled = _a.disabled, onClick = _a.onClick;
        var icon = null;
        if (svg) {
            icon = React.createElement(svg_icon_1.SvgIcon, { svg: svg });
        }
        return React.createElement("button", { className: dom_1.classNames("button", type, className, { icon: icon, active: active }), onClick: onClick, disabled: disabled },
            icon,
            title);
    };
    return Button;
}(React.Component));
exports.Button = Button;
//# sourceMappingURL=button.js.map