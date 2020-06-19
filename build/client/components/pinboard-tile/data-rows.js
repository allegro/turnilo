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
var selectable_rows_1 = require("./selectable-rows");
var text_rows_1 = require("./text-rows");
var row_mode_1 = require("./utils/row-mode");
var EditableRows = function (props) {
    var rowMode = props.rowMode, commonProps = __rest(props, ["rowMode"]);
    switch (rowMode.state) {
        case row_mode_1.EditState.READY:
            return React.createElement(text_rows_1.TextRows, __assign({}, commonProps, { onClick: rowMode.createClause }));
        case row_mode_1.EditState.IN_EDIT:
            return React.createElement(selectable_rows_1.SelectableRows, __assign({}, commonProps, { clause: rowMode.clause, onSelect: rowMode.toggleValue }));
    }
};
exports.DataRows = function (_a) {
    var rowMode = _a.rowMode, commonProps = __rest(_a, ["rowMode"]);
    switch (rowMode.mode) {
        case row_mode_1.RowModeId.READONLY:
            return React.createElement(text_rows_1.TextRows, __assign({}, commonProps));
        case row_mode_1.RowModeId.EDITABLE:
            return React.createElement(EditableRows, __assign({}, commonProps, { rowMode: rowMode }));
    }
};
//# sourceMappingURL=data-rows.js.map