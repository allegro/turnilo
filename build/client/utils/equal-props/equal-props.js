"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_utils_1 = require("../../../common/utils/immutable-utils/immutable-utils");
function equals(a, b) {
    if (a === null) {
        return a === b;
    }
    if (immutable_utils_1.isEqualable(a)) {
        return a.equals(b);
    }
    return a === b;
}
function equalProps(oldProps, newProps) {
    var keys = Object.keys(oldProps);
    return keys.every(function (key) { return equals(oldProps[key], newProps[key]); });
}
exports.equalProps = equalProps;
//# sourceMappingURL=equal-props.js.map