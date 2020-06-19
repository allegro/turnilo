"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var svg_icon_1 = require("../svg-icon/svg-icon");
require("./clearable-input.scss");
function focusOnInput(input) {
    if (!input)
        return;
    input.focus();
    var length = input.value.length;
    input.setSelectionRange(length, length);
}
exports.ClearableInput = function (_a) {
    var className = _a.className, placeholder = _a.placeholder, focusOnMount = _a.focusOnMount, onBlur = _a.onBlur, onChange = _a.onChange, _b = _a.value, value = _b === void 0 ? "" : _b, _c = _a.type, type = _c === void 0 ? "text" : _c;
    var change = function (e) { return onChange(e.target.value); };
    var clear = function () { return onChange(""); };
    var ref = focusOnMount ? focusOnInput : null;
    var classNames = ["clearable-input"];
    if (className)
        classNames.push(className);
    if (!value)
        classNames.push("empty");
    return React.createElement("div", { className: classNames.join(" ") },
        React.createElement("input", { type: type, placeholder: placeholder, value: value, onChange: change, onBlur: onBlur, ref: ref }),
        React.createElement("div", { className: "clear", onClick: clear },
            React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/x.svg") })));
};
//# sourceMappingURL=clearable-input.js.map