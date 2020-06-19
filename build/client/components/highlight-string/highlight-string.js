"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("../../utils/dom/dom");
require("./highlight-string.scss");
function highlightByIndex(text, start, end) {
    return [
        React.createElement("span", { className: "pre", key: "pre" }, text.substring(0, start)),
        React.createElement("span", { className: "bold", key: "bold" }, text.substring(start, end)),
        React.createElement("span", { className: "post", key: "post" }, text.substring(end))
    ];
}
function highlightBy(text, highlight) {
    if (!highlight)
        return text;
    if (typeof highlight === "string") {
        var strLower = text.toLowerCase();
        var startIndex_1 = strLower.indexOf(highlight.toLowerCase());
        if (startIndex_1 === -1)
            return text;
        return highlightByIndex(text, startIndex_1, startIndex_1 + highlight.length);
    }
    var match = text.match(highlight);
    if (!match)
        return text;
    var startIndex = match.index;
    return highlightByIndex(text, startIndex, startIndex + match[0].length);
}
exports.HighlightString = function (_a) {
    var className = _a.className, text = _a.text, highlight = _a.highlight;
    return React.createElement("span", { className: dom_1.classNames("highlight-string", className) }, highlightBy(text, highlight));
};
//# sourceMappingURL=highlight-string.js.map