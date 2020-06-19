"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var general_1 = require("../general/general");
function noop() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
}
exports.noop = noop;
exports.identity = function (x) { return x; };
exports.constant = function (val) { return function () { return val; }; };
exports.compose = function (f, g) {
    return function (x) { return g(f(x)); };
};
function cons(coll, element) {
    return coll.concat([element]);
}
exports.cons = cons;
function zip(xs, ys) {
    var length = Math.min(xs.length, ys.length);
    return xs.slice(0, length).map(function (x, idx) {
        var y = ys[idx];
        return [x, y];
    });
}
exports.zip = zip;
function flatMap(coll, mapper) {
    return [].concat.apply([], coll.map(mapper));
}
exports.flatMap = flatMap;
function concatTruthy() {
    var elements = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        elements[_i] = arguments[_i];
    }
    return elements.reduce(function (result, element) { return general_1.isTruthy(element) ? cons(result, element) : result; }, []);
}
exports.concatTruthy = concatTruthy;
function mapTruthy(coll, f) {
    return coll.reduce(function (result, element, idx) {
        var mapped = f(element, idx);
        return general_1.isTruthy(mapped) ? cons(result, mapped) : result;
    }, []);
}
exports.mapTruthy = mapTruthy;
function thread(x) {
    var fns = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        fns[_i - 1] = arguments[_i];
    }
    return fns.reduce(function (x, f) { return f(x); }, x);
}
exports.thread = thread;
function threadNullable(x) {
    var fns = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        fns[_i - 1] = arguments[_i];
    }
    return fns.reduce(function (x, f) { return general_1.isTruthy(x) ? f(x) : x; }, x);
}
exports.threadNullable = threadNullable;
var isCallable = function (f) { return typeof f === "function"; };
function threadConditionally(x) {
    var fns = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        fns[_i - 1] = arguments[_i];
    }
    return fns.reduce(function (x, f) { return isCallable(f) ? f(x) : x; }, x);
}
exports.threadConditionally = threadConditionally;
function complement(p) {
    return function (x) { return !p(x); };
}
exports.complement = complement;
function range(from, to) {
    var result = [];
    var n = from;
    while (n < to) {
        result.push(n);
        n += 1;
    }
    return result;
}
exports.range = range;
function debounceWithPromise(fn, ms) {
    var timeoutId;
    var debouncedFn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var resolve;
        var promise = new Promise(function (pResolve) {
            resolve = pResolve;
        });
        var callLater = function () {
            timeoutId = undefined;
            resolve(fn.apply(void 0, args));
        };
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(callLater, ms);
        return promise;
    };
    debouncedFn.cancel = function () { return timeoutId && clearTimeout(timeoutId); };
    return debouncedFn;
}
exports.debounceWithPromise = debounceWithPromise;
//# sourceMappingURL=functional.js.map