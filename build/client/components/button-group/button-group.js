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
require("./button-group.scss");
var ButtonGroup = (function (_super) {
    __extends(ButtonGroup, _super);
    function ButtonGroup() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ButtonGroup.prototype.renderMembers = function () {
        var groupMembers = this.props.groupMembers;
        return groupMembers.map(function (button) {
            return React.createElement("li", { className: dom_1.classNames("group-member", button.className, { selected: button.isSelected }), key: button.key, onClick: button.onClick }, button.title);
        });
    };
    ButtonGroup.prototype.render = function () {
        var _a = this.props, title = _a.title, className = _a.className;
        return React.createElement("div", { className: dom_1.classNames("button-group", className) },
            title ? React.createElement("div", { className: "button-group-title" }, title) : null,
            React.createElement("ul", { className: "group-container" }, this.renderMembers()));
    };
    return ButtonGroup;
}(React.Component));
exports.ButtonGroup = ButtonGroup;
//# sourceMappingURL=button-group.js.map