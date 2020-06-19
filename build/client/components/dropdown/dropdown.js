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
var ReactDOM = require("react-dom");
var dom_1 = require("../../utils/dom/dom");
var svg_icon_1 = require("../svg-icon/svg-icon");
require("./dropdown.scss");
function simpleEqual(item1, item2) {
    return item1 === item2;
}
var Dropdown = (function (_super) {
    __extends(Dropdown, _super);
    function Dropdown() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            open: false
        };
        _this.onClick = function () {
            _this.setState(function (_a) {
                var open = _a.open;
                return ({ open: !open });
            });
        };
        _this.globalMouseDownListener = function (e) {
            var open = _this.state.open;
            if (!open)
                return;
            var myElement = ReactDOM.findDOMNode(_this);
            if (!myElement)
                return;
            var target = e.target;
            if (dom_1.isInside(target, myElement))
                return;
            _this.setState({ open: false });
        };
        _this.globalKeyDownListener = function (e) {
            if (!dom_1.escapeKey(e))
                return;
            var open = _this.state.open;
            if (!open)
                return;
            _this.setState({ open: false });
        };
        return _this;
    }
    Dropdown.prototype.componentDidMount = function () {
        window.addEventListener("mousedown", this.globalMouseDownListener);
        window.addEventListener("keydown", this.globalKeyDownListener);
    };
    Dropdown.prototype.componentWillUnmount = function () {
        window.removeEventListener("mousedown", this.globalMouseDownListener);
        window.removeEventListener("keydown", this.globalKeyDownListener);
    };
    Dropdown.prototype.renderMenu = function () {
        var _a = this.props, items = _a.items, _b = _a.renderItem, renderItem = _b === void 0 ? String : _b, _c = _a.keyItem, keyItem = _c === void 0 ? renderItem : _c, selectedItem = _a.selectedItem, _d = _a.equal, equal = _d === void 0 ? simpleEqual : _d, onSelect = _a.onSelect, menuClassName = _a.menuClassName;
        if (!items || !items.length)
            return null;
        var itemElements = items.map(function (item) {
            return React.createElement("div", { className: dom_1.classNames("dropdown-item", { selected: selectedItem && equal(item, selectedItem) }), key: keyItem(item), onClick: function () { return onSelect(item); } }, renderItem(item));
        });
        return React.createElement("div", { className: dom_1.classNames("dropdown-menu", menuClassName) }, itemElements);
    };
    Dropdown.prototype.render = function () {
        var _a = this.props, label = _a.label, _b = _a.renderItem, renderItem = _b === void 0 ? String : _b, selectedItem = _a.selectedItem, _c = _a.direction, direction = _c === void 0 ? "down" : _c, _d = _a.renderSelectedItem, renderSelectedItem = _d === void 0 ? renderItem : _d, className = _a.className;
        var open = this.state.open;
        var labelElement = label && React.createElement("div", { className: "dropdown-label" }, label);
        return React.createElement("div", { className: dom_1.classNames("dropdown", direction, className), onClick: this.onClick },
            labelElement,
            React.createElement("div", { className: dom_1.classNames("selected-item", { active: open }) },
                renderSelectedItem(selectedItem),
                React.createElement(svg_icon_1.SvgIcon, { className: "caret-icon", svg: require("../../icons/dropdown-caret.svg") })),
            open ? this.renderMenu() : null);
    };
    return Dropdown;
}(React.Component));
exports.Dropdown = Dropdown;
//# sourceMappingURL=dropdown.js.map