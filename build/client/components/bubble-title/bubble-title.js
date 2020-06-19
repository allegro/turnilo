"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("../../utils/dom/dom");
var PER_LETTER_PIXELS = 8;
var MIN_TITLE_WIDTH = 80;
var MAX_TITLE_WIDTH = 300;
exports.BubbleTitle = function (_a) {
    var title = _a.title;
    var minWidth = dom_1.clamp(title.length * PER_LETTER_PIXELS, MIN_TITLE_WIDTH, MAX_TITLE_WIDTH);
    return React.createElement("div", { className: "title", style: { minWidth: minWidth } }, title);
};
//# sourceMappingURL=bubble-title.js.map