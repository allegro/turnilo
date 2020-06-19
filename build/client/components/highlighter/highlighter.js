"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
require("./highlighter.scss");
function Highlighter(props) {
    var highlightRange = props.highlightRange, scaleX = props.scaleX;
    if (!highlightRange)
        return null;
    var startPos = scaleX(highlightRange.start);
    var endPos = scaleX(highlightRange.end);
    var whiteoutLeftStyle = {
        width: Math.max(startPos, 0)
    };
    var frameStyle = {
        left: startPos,
        width: Math.max(endPos - startPos, 0)
    };
    var whiteoutRightStyle = {
        left: endPos
    };
    return React.createElement("div", { className: "highlighter" },
        React.createElement("div", { className: "whiteout left", style: whiteoutLeftStyle }),
        React.createElement("div", { className: "frame", style: frameStyle }),
        React.createElement("div", { className: "whiteout right", style: whiteoutRightStyle }));
}
exports.Highlighter = Highlighter;
//# sourceMappingURL=highlighter.js.map