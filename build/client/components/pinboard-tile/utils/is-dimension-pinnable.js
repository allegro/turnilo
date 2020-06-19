"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isDimensionPinnable(dimension) {
    return dimension.kind === "boolean" || dimension.kind === "string";
}
exports.isDimensionPinnable = isDimensionPinnable;
//# sourceMappingURL=is-dimension-pinnable.js.map