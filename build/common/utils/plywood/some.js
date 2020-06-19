"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function some(ex, predicate) {
    var found = false;
    ex.forEach(function (subEx) {
        if (predicate(subEx)) {
            found = true;
        }
    });
    return found;
}
exports.default = some;
//# sourceMappingURL=some.js.map