"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var table_1 = require("../table");
require("./highlight.scss");
exports.Highlighter = function (props) {
    var highlightedIndex = props.highlightedIndex, scrollTopOffset = props.scrollTopOffset, highlightedNesting = props.highlightedNesting, collapseRows = props.collapseRows;
    var top = highlightedIndex * table_1.ROW_HEIGHT - scrollTopOffset;
    var left = collapseRows ? 0 : Math.max(0, highlightedNesting - 1) * table_1.INDENT_WIDTH;
    return React.createElement("div", { className: "highlight-cont" },
        React.createElement("div", { className: "highlight" },
            React.createElement("div", { className: "highlighter", key: "highlight", style: { top: top, left: left } })));
};
//# sourceMappingURL=highlight.js.map