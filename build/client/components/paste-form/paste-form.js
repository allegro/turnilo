"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_1 = require("immutable");
var React = require("react");
var button_1 = require("../button/button");
require("./paste-form.scss");
function focus(textArea) {
    if (!textArea)
        return;
    textArea.focus();
}
var PasteForm = (function (_super) {
    __extends(PasteForm, _super);
    function PasteForm() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { value: "" };
        _this.values = function () {
            var value = _this.state.value;
            return immutable_1.Set(value
                .split("\n")
                .map(function (s) { return s.trim(); })
                .filter(function (s) { return s.length > 0; }));
        };
        _this.select = function () {
            var _a = _this.props, onClose = _a.onClose, onSelect = _a.onSelect;
            var values = _this.values();
            if (values.isEmpty())
                return;
            onSelect(immutable_1.Set(values));
            onClose();
        };
        _this.cancel = function () { return _this.props.onClose(); };
        _this.saveValue = function (_a) {
            var value = _a.target.value;
            return _this.setState({ value: value });
        };
        return _this;
    }
    PasteForm.prototype.render = function () {
        var value = this.state.value;
        var disabled = this.values().isEmpty();
        return React.createElement("div", null,
            React.createElement("textarea", { ref: focus, className: "paste-field", value: value, onChange: this.saveValue }),
            React.createElement("div", { className: "paste-actions" },
                React.createElement(button_1.Button, { type: "primary", title: "Select", disabled: disabled, onClick: this.select }),
                React.createElement(button_1.Button, { type: "secondary", title: "Cancel", onClick: this.cancel })));
    };
    return PasteForm;
}(React.Component));
exports.PasteForm = PasteForm;
//# sourceMappingURL=paste-form.js.map