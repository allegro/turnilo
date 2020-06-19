"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var body_portal_1 = require("../body-portal/body-portal");
var bubble_title_1 = require("../bubble-title/bubble-title");
var shpitz_1 = require("../shpitz/shpitz");
require("./segment-bubble.scss");
var OFFSET_V = -10;
exports.SegmentBubble = function (props) {
    var left = props.left, top = props.top, title = props.title, content = props.content;
    return React.createElement(body_portal_1.BodyPortal, { left: left, top: top + OFFSET_V },
        React.createElement("div", { className: "segment-bubble" },
            React.createElement(exports.SegmentBubbleContent, { title: title, content: content }),
            React.createElement(shpitz_1.Shpitz, { direction: "up" })));
};
exports.SegmentBubbleContent = function (_a) {
    var title = _a.title, content = _a.content;
    return (React.createElement("div", { className: "segment-bubble-text" },
        React.createElement(bubble_title_1.BubbleTitle, { title: title }),
        content ? React.createElement("div", { className: "content" }, content) : null));
};
//# sourceMappingURL=segment-bubble.js.map