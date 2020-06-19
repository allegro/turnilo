"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var marked_1 = require("marked");
var React = require("react");
require("./markdown-node.scss");
function innerMarkdown(input) {
    return { __html: marked_1.parse(input) };
}
exports.MarkdownNode = function (_a) {
    var markdown = _a.markdown;
    return React.createElement("div", { className: "markdown-content", dangerouslySetInnerHTML: innerMarkdown(markdown) });
};
//# sourceMappingURL=markdown-node.js.map