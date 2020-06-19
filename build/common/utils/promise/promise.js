"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function timeout(ms) {
    return new Promise(function (resolve, reject) {
        var id = setTimeout(function () {
            clearTimeout(id);
            reject("Timed out in " + ms + "ms.");
        }, ms);
    });
}
exports.timeout = timeout;
var Deferred = (function () {
    function Deferred() {
        var _this = this;
        this.promise = new Promise(function (resolve, reject) {
            _this.resolve = resolve;
            _this.reject = reject;
        });
    }
    return Deferred;
}());
exports.Deferred = Deferred;
//# sourceMappingURL=promise.js.map