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
var data_rows_1 = require("./data-rows");
function noResultsMessage(searchText) {
    return searchText ? "No results for \"" + searchText + "\"" : "No results";
}
exports.PinboardDataset = function (props) {
    var data = props.data, searchText = props.searchText;
    var noResults = data.length === 0;
    return React.createElement("div", { className: "rows" }, noResults ?
        React.createElement("div", { className: "message" }, noResultsMessage(searchText)) :
        React.createElement(data_rows_1.DataRows, __assign({}, props)));
};
//# sourceMappingURL=pinboard-dataset.js.map