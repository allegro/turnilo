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
var body_portal_1 = require("../body-portal/body-portal");
var global_event_listener_1 = require("../global-event-listener/global-event-listener");
var golden_center_1 = require("../golden-center/golden-center");
var svg_icon_1 = require("../svg-icon/svg-icon");
require("./modal.scss");
var Modal = (function (_super) {
    __extends(Modal, _super);
    function Modal(props) {
        var _this = _super.call(this, props) || this;
        _this.focusAlreadyGiven = false;
        _this.onEscape = function () {
            var _a = _this.props, onClose = _a.onClose, mandatory = _a.mandatory;
            if (!mandatory)
                onClose();
        };
        _this.onEnter = function () {
            var onEnter = _this.props.onEnter;
            if (onEnter) {
                onEnter();
            }
        };
        _this.onMouseDown = function (e) {
            var _a = _this.props, onClose = _a.onClose, mandatory = _a.mandatory;
            if (mandatory)
                return;
            var id = _this.state.id;
            var myElement = document.getElementById(id);
            if (!myElement)
                return;
            var target = e.target;
            if (dom_1.isInside(target, myElement))
                return;
            onClose();
        };
        _this.state = {
            id: null
        };
        return _this;
    }
    Modal.prototype.componentWillMount = function () {
        var id = this.props.id;
        this.setState({
            id: id || dom_1.uniqueId("modal-")
        });
    };
    Modal.prototype.componentDidMount = function () {
        this.maybeFocus();
    };
    Modal.prototype.componentDidUpdate = function () {
        this.maybeFocus();
    };
    Modal.prototype.getChildByID = function (children, id) {
        if (!children)
            return null;
        var n = children.length;
        for (var i = 0; i < n; i++) {
            var child = children[i];
            if (child.getAttribute && child.getAttribute("id") === id)
                return child;
            if (child.childNodes) {
                var foundChild = this.getChildByID(child.childNodes, id);
                if (foundChild)
                    return foundChild;
            }
        }
        return null;
    };
    Modal.prototype.maybeFocus = function () {
        if (this.props.startUpFocusOn) {
            var myElement = document.getElementById(this.state.id);
            var target = this.getChildByID(myElement.childNodes, this.props.startUpFocusOn);
            if (!this.focusAlreadyGiven && !!target) {
                target.focus();
                this.focusAlreadyGiven = true;
            }
        }
    };
    Modal.prototype.render = function () {
        var _a = this.props, className = _a.className, title = _a.title, children = _a.children, onClose = _a.onClose;
        var id = this.state.id;
        var titleElement = null;
        if (typeof title === "string") {
            titleElement = React.createElement("div", { className: "modal-title" },
                React.createElement("div", { className: "text" }, title),
                React.createElement("div", { className: "close", onClick: onClose },
                    React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/full-remove.svg") })));
        }
        return React.createElement(body_portal_1.BodyPortal, { fullSize: true },
            React.createElement("div", { className: dom_1.classNames("modal", className) },
                React.createElement(global_event_listener_1.GlobalEventListener, { enter: this.onEnter, escape: this.onEscape, mouseDown: this.onMouseDown }),
                React.createElement("div", { className: "backdrop" }),
                React.createElement(golden_center_1.GoldenCenter, null,
                    React.createElement("div", { className: "modal-window", id: id },
                        titleElement,
                        children))));
    };
    return Modal;
}(React.Component));
exports.Modal = Modal;
//# sourceMappingURL=modal.js.map