"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var general_1 = require("../general/general");
function extend(source, target) {
    for (var key in source) {
        target[key] = source[key];
    }
    return target;
}
exports.extend = extend;
function omitFalsyValues(obj) {
    return Object.keys(obj).reduce(function (res, key) {
        if (general_1.isTruthy(obj[key])) {
            res[key] = obj[key];
        }
        return res;
    }, {});
}
exports.omitFalsyValues = omitFalsyValues;
//# sourceMappingURL=object.js.map