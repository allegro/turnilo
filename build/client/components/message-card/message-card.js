"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
require("./message-card.scss");
exports.MessageCard = function (props) {
    var title = props.title, children = props.children;
    return React.createElement("div", { className: "message-card" },
        React.createElement("div", { className: "message-card-title" }, title),
        children);
};
//# sourceMappingURL=message-card.js.map