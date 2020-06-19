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
var boolean_filter_menu_1 = require("./boolean-filter-menu/boolean-filter-menu");
require("./filter-menu.scss");
var number_filter_menu_1 = require("./number-filter-menu/number-filter-menu");
var string_filter_menu_1 = require("./string-filter-menu/string-filter-menu");
var time_filter_menu_1 = require("./time-filter-menu/time-filter-menu");
exports.FilterMenu = function (props) {
    if (!props.dimension)
        return null;
    switch (props.dimension.kind) {
        case "time":
            return React.createElement(time_filter_menu_1.TimeFilterMenu, __assign({}, props));
        case "boolean":
            return React.createElement(boolean_filter_menu_1.BooleanFilterMenu, __assign({}, props));
        case "number":
            return React.createElement(number_filter_menu_1.NumberFilterMenu, __assign({}, props));
        default:
            return React.createElement(string_filter_menu_1.StringFilterMenu, __assign({}, props));
    }
};
//# sourceMappingURL=filter-menu.js.map