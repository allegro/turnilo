"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("../../utils/dom/dom");
require("./message.scss");
exports.Message = function (props) {
    var content = props.content, title = props.title, _a = props.level, level = _a === void 0 ? "notice" : _a;
    return React.createElement("div", { className: dom_1.classNames("message", level) },
        React.createElement("div", { className: "whiteout" }),
        React.createElement("div", { className: "message-container" },
            React.createElement("div", { className: "message-title" }, title),
            React.createElement("div", { className: "message-content" }, content)));
};
//# sourceMappingURL=message.js.map