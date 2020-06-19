"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IP_REGEX = /^(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))$/;
exports.NUM_REGEX = /^\d+$/;
function firstUp(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : undefined;
}
exports.firstUp = firstUp;
function pad(n, padding) {
    if (padding === void 0) { padding = 3; }
    var str = String(n);
    if (str.length > padding)
        return str;
    while (str.length < padding)
        str = "0" + str;
    return str;
}
exports.pad = pad;
function generateUniqueName(prefix, isUnique) {
    var i = 0;
    var name = prefix + pad(i);
    while (!isUnique(name)) {
        name = prefix + pad(++i);
    }
    return name;
}
exports.generateUniqueName = generateUniqueName;
//# sourceMappingURL=string.js.map