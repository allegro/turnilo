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
var React = require("react");
var input_with_presets_1 = require("../input-with-presets/input-with-presets");
function parse(s) {
    var n = parseFloat(s);
    return isNaN(n) ? 0 : n;
}
function format(n) {
    return n.toString();
}
exports.QuantilePicker = function (props) {
    return React.createElement(input_with_presets_1.InputWithPresets, __assign({}, props, { parseCustomValue: parse, formatCustomValue: format }));
};
//# sourceMappingURL=quantile-picker.js.map