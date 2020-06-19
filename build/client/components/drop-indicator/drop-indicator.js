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
var svg_icon_1 = require("../svg-icon/svg-icon");
require("./drop-indicator.scss");
var DropIndicator = (function (_super) {
    __extends(DropIndicator, _super);
    function DropIndicator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DropIndicator.prototype.render = function () {
        return React.createElement("div", { className: "drop-indicator" },
            React.createElement("div", { className: "white-out" }),
            React.createElement("div", { className: "action" },
                React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/split-replace.svg") })));
    };
    return DropIndicator;
}(React.Component));
exports.DropIndicator = DropIndicator;
//# sourceMappingURL=drop-indicator.js.map