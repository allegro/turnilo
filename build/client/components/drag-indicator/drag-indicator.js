"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var fancy_drag_indicator_1 = require("./fancy-drag-indicator");
exports.DragIndicator = function (props) {
    var dragPosition = props.dragPosition, dragOver = props.dragOver, drop = props.drop, dragLeave = props.dragLeave;
    if (!dragPosition)
        return null;
    return React.createElement(React.Fragment, null,
        React.createElement(fancy_drag_indicator_1.FancyDragIndicator, { dragPosition: dragPosition }),
        React.createElement("div", { className: "drag-mask", onDragOver: dragOver, onDragLeave: dragLeave, onDragExit: dragLeave, onDrop: drop }));
};
//# sourceMappingURL=drag-indicator.js.map