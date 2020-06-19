"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var constants_1 = require("../../config/constants");
var bubble_title_1 = require("../bubble-title/bubble-title");
var button_1 = require("../button/button");
var modal_bubble_1 = require("../modal-bubble/modal-bubble");
require("./highlight-modal.scss");
exports.HighlightModal = function (_a) {
    var title = _a.title, children = _a.children, left = _a.left, top = _a.top, acceptHighlight = _a.acceptHighlight, dropHighlight = _a.dropHighlight;
    return React.createElement(modal_bubble_1.ModalBubble, { className: "highlight-modal", left: left, top: top, onClose: dropHighlight },
        React.createElement(bubble_title_1.BubbleTitle, { title: title }),
        React.createElement("div", { className: "value" }, children),
        React.createElement("div", { className: "actions" },
            React.createElement(button_1.Button, { type: "primary", className: "accept mini", onClick: acceptHighlight, title: constants_1.STRINGS.select }),
            React.createElement(button_1.Button, { type: "secondary", className: "drop mini", onClick: dropHighlight, title: constants_1.STRINGS.cancel })));
};
//# sourceMappingURL=highlight-modal.js.map