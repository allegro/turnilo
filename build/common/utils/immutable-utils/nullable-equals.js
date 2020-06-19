"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function nullableEquals(a, b) {
    if (a === null) {
        return a === b;
    }
    return !!a.equals(b);
}
exports.default = nullableEquals;
//# sourceMappingURL=nullable-equals.js.map