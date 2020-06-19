"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var svg_icon_1 = require("../svg-icon/svg-icon");
require("./nav-logo.scss");
exports.NavLogo = function (_a) {
    var customLogoSvg = _a.customLogoSvg;
    return React.createElement("div", { className: "nav-logo" },
        React.createElement("div", { className: "logo" },
            React.createElement(svg_icon_1.SvgIcon, { svg: customLogoSvg })));
};
//# sourceMappingURL=nav-logo.js.map