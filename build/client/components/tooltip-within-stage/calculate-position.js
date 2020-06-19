"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function calculatePosition(props, rect) {
    var initialTop = props.top, initialLeft = props.left, stage = props.stage, _a = props.margin, margin = _a === void 0 ? 10 : _a;
    if (!rect) {
        var top_1 = initialTop + margin;
        var left_1 = initialLeft + margin;
        return { top: top_1, left: left_1 };
    }
    var stageBottom = stage.y + stage.height;
    var stageRight = stage.x + stage.width;
    var top = rect.bottom > stageBottom
        ? initialTop - margin - rect.height
        : rect.top < stage.y
            ? initialTop + rect.height
            : initialTop + margin;
    var left = rect.right > stageRight
        ? initialLeft - margin - rect.width
        : rect.left < stage.x
            ? initialLeft + rect.width
            : initialLeft + margin;
    return { top: top, left: left };
}
exports.calculatePosition = calculatePosition;
//# sourceMappingURL=calculate-position.js.map