"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getBoundingClientOffset(element) {
    if (element === window) {
        return { top: 0, left: 0 };
    }
    return element.getBoundingClientRect();
}
function mouseEventOffset(event) {
    var target = event.currentTarget;
    var cx = event.clientX || 0;
    var cy = event.clientY || 0;
    var _a = getBoundingClientOffset(target), left = _a.left, top = _a.top;
    return [cx - left, cy - top];
}
exports.mouseEventOffset = mouseEventOffset;
//# sourceMappingURL=mouse-event-offset.js.map