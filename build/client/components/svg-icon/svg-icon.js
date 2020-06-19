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
require("./svg-icon.scss");
var SvgIcon = (function (_super) {
    __extends(SvgIcon, _super);
    function SvgIcon() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SvgIcon.prototype.render = function () {
        var _a = this.props, className = _a.className, style = _a.style, svg = _a.svg;
        var viewBox = null;
        var svgInsides = null;
        if (typeof svg === "string") {
            svgInsides = svg
                .substr(0, svg.length - 6)
                .replace(/^<svg [^>]+>\s*/i, function (svgDec) {
                var vbMatch = svgDec.match(/viewBox="([\d ]+)"/);
                if (vbMatch)
                    viewBox = vbMatch[1];
                return "";
            });
        }
        else {
            console.warn("svg-icon.tsx: missing icon");
            viewBox = "0 0 16 16";
            svgInsides = "<rect width=16 height=16 fill='red'></rect>";
        }
        return React.createElement("svg", {
            className: "svg-icon " + (className || ""),
            viewBox: viewBox,
            preserveAspectRatio: "xMidYMid meet",
            style: style,
            dangerouslySetInnerHTML: { __html: svgInsides }
        });
    };
    return SvgIcon;
}(React.Component));
exports.SvgIcon = SvgIcon;
//# sourceMappingURL=svg-icon.js.map