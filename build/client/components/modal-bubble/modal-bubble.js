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
var shpitz_1 = require("../shpitz/shpitz");
require("./modal-bubble.scss");
var ModalBubble = (function (_super) {
    __extends(ModalBubble, _super);
    function ModalBubble() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.setModalRef = function (el) {
            _this.modalRef = el;
        };
        _this.onMouseDown = function (e) {
            var target = e.target;
            if (dom_1.isInside(target, _this.modalRef))
                return;
            _this.props.onClose();
        };
        return _this;
    }
    ModalBubble.prototype.render = function () {
        var _a = this.props, className = _a.className, children = _a.children, left = _a.left, top = _a.top;
        return React.createElement(React.Fragment, null,
            React.createElement(global_event_listener_1.GlobalEventListener, { mouseDown: this.onMouseDown }),
            React.createElement(body_portal_1.BodyPortal, { left: left, top: top },
                React.createElement("div", { className: dom_1.classNames("modal-bubble", className), ref: this.setModalRef },
                    children,
                    React.createElement(shpitz_1.Shpitz, { direction: "up" }))));
    };
    return ModalBubble;
}(React.Component));
exports.ModalBubble = ModalBubble;
//# sourceMappingURL=modal-bubble.js.map