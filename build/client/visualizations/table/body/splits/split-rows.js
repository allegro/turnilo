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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var flattened_splits_1 = require("./flattened-splits");
var nested_splits_1 = require("./nested-splits");
exports.SplitRows = function (props) {
    var collapseRows = props.collapseRows, rest = __rest(props, ["collapseRows"]);
    var data = rest.data;
    if (!data)
        return null;
    return collapseRows ?
        React.createElement(flattened_splits_1.FlattenedSplits, __assign({}, rest)) :
        React.createElement(nested_splits_1.NestedSplits, __assign({}, rest));
};
//# sourceMappingURL=split-rows.js.map