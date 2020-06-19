"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("../../../../utils/dom/dom");
require("./measure-background.scss");
exports.MeasureBackground = function (_a) {
    var highlight = _a.highlight, width = _a.width;
    return React.createElement("div", { className: "measure-background-container" },
        React.createElement("div", { className: dom_1.classNames("measure-background", { highlight: highlight }), style: { width: width + "%" } }));
};
//# sourceMappingURL=measure-background.js.map