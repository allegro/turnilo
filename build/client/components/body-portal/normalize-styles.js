"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var object_1 = require("../../../common/utils/object/object");
function normalizeDimension(dimension) {
    if (typeof dimension === "number") {
        return Math.round(dimension) + "px";
    }
    if (typeof dimension === "string") {
        return dimension;
    }
    return undefined;
}
function normalizeStyles(source) {
    var left = source.left, top = source.top, bottom = source.bottom, right = source.right, disablePointerEvents = source.disablePointerEvents, isAboveAll = source.isAboveAll;
    var dimensions = {
        top: normalizeDimension(top),
        bottom: normalizeDimension(bottom),
        left: normalizeDimension(left),
        right: normalizeDimension(right)
    };
    return __assign({}, object_1.omitFalsyValues(dimensions), { zIndex: 200 + (isAboveAll ? 1 : 0), pointerEvents: disablePointerEvents ? "none" : "auto" });
}
exports.default = normalizeStyles;
//# sourceMappingURL=normalize-styles.js.map