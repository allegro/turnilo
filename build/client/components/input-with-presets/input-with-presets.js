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
var React = require("react");
var dom_1 = require("../../utils/dom/dom");
var button_group_1 = require("../button-group/button-group");
require("./input-with-presets.scss");
var InputWithPresets = (function (_super) {
    __extends(InputWithPresets, _super);
    function InputWithPresets() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = _this.initialState();
        _this.customValueUpdate = function (e) {
            var _a = _this.props, onChange = _a.onChange, parseCustomValue = _a.parseCustomValue;
            var customValue = e.currentTarget.value;
            onChange(parseCustomValue(customValue));
            _this.setState({ customValue: customValue });
        };
        _this.pickCustom = function () {
            var _a = _this.props, onChange = _a.onChange, parseCustomValue = _a.parseCustomValue;
            _this.setState({ customPicked: true });
            onChange(parseCustomValue(_this.state.customValue));
        };
        _this.pickPreset = function (value) {
            var onChange = _this.props.onChange;
            _this.setState({ customPicked: false });
            onChange(value);
        };
        return _this;
    }
    InputWithPresets.prototype.initialState = function () {
        var _a = this.props, selected = _a.selected, presets = _a.presets, formatCustomValue = _a.formatCustomValue;
        var isPresetPicked = presets.some(function (_a) {
            var identity = _a.identity;
            return identity === selected;
        });
        var customPicked = selected !== undefined && !isPresetPicked;
        var customValue = customPicked ? formatCustomValue(selected) : "";
        return { customPicked: customPicked, customValue: customValue };
    };
    InputWithPresets.prototype.render = function () {
        var _this = this;
        var _a = this.props, errorMessage = _a.errorMessage, selected = _a.selected, presets = _a.presets, placeholder = _a.placeholder, title = _a.title, parseCustomValue = _a.parseCustomValue;
        var _b = this.state, customPicked = _b.customPicked, customValue = _b.customValue;
        var presetButtons = presets.map(function (_a) {
            var name = _a.name, identity = _a.identity;
            return ({
                key: String(identity),
                title: name,
                isSelected: !customPicked && identity === selected,
                onClick: function () { return _this.pickPreset(identity); }
            });
        });
        var customSelected = customPicked && selected === parseCustomValue(customValue);
        var customButton = {
            key: "custom",
            title: "…",
            onClick: this.pickCustom,
            isSelected: customSelected
        };
        var members = presetButtons.concat([customButton]);
        var renderErrorMessage = customSelected && errorMessage && customValue.length > 0;
        return React.createElement(React.Fragment, null,
            React.createElement(button_group_1.ButtonGroup, { title: title, groupMembers: members }),
            customSelected && React.createElement("input", { type: "text", className: dom_1.classNames("custom-input", { invalid: errorMessage }), placeholder: placeholder, value: customValue, onChange: this.customValueUpdate }),
            renderErrorMessage && React.createElement("span", { className: "error-message" }, errorMessage));
    };
    return InputWithPresets;
}(React.Component));
exports.InputWithPresets = InputWithPresets;
//# sourceMappingURL=input-with-presets.js.map