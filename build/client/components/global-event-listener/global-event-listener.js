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
var string_1 = require("../../../common/utils/string/string");
var dom_1 = require("../../utils/dom/dom");
var GlobalEventListener = (function (_super) {
    __extends(GlobalEventListener, _super);
    function GlobalEventListener() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.propsToEvents = {
            resize: "resize",
            scroll: "scroll",
            mouseDown: "mousedown",
            mouseMove: "mousemove",
            mouseUp: "mouseup",
            keyDown: "keydown",
            enter: "keydown",
            escape: "keydown",
            right: "keydown",
            left: "keydown"
        };
        _this.onResize = function () {
            if (_this.props.resize)
                _this.props.resize();
        };
        _this.onScroll = function (e) {
            if (_this.props.scroll)
                _this.props.scroll(e);
        };
        _this.onMousedown = function (e) {
            if (_this.props.mouseDown)
                _this.props.mouseDown(e);
        };
        _this.onMousemove = function (e) {
            if (_this.props.mouseMove)
                _this.props.mouseMove(e);
        };
        _this.onMouseup = function (e) {
            if (_this.props.mouseUp)
                _this.props.mouseUp(e);
        };
        _this.onKeydown = function (e) {
            if (_this.props.escape && dom_1.escapeKey(e))
                _this.props.escape(e);
            if (_this.props.enter && dom_1.enterKey(e))
                _this.props.enter(e);
            if (_this.props.right && dom_1.rightKey(e))
                _this.props.right(e);
            if (_this.props.left && dom_1.leftKey(e))
                _this.props.left(e);
            if (_this.props.keyDown)
                _this.props.keyDown(e);
        };
        return _this;
    }
    GlobalEventListener.prototype.componentWillReceiveProps = function (nextProps) {
        this.refreshListeners(nextProps, this.props);
    };
    GlobalEventListener.prototype.componentDidMount = function () {
        this.refreshListeners(this.props);
    };
    GlobalEventListener.prototype.componentWillUnmount = function () {
        for (var prop in this.propsToEvents) {
            this.removeListener(this.propsToEvents[prop]);
        }
    };
    GlobalEventListener.prototype.refreshListeners = function (nextProps, currentProps) {
        if (currentProps === void 0) { currentProps = {}; }
        var toAdd = [];
        var toRemove = [];
        for (var prop in this.propsToEvents) {
            var event_1 = this.propsToEvents[prop];
            if (currentProps[prop] && nextProps[prop])
                continue;
            if (nextProps[prop] && toAdd.indexOf(event_1) === -1) {
                toAdd.push(event_1);
            }
            else if (currentProps[prop] && toRemove.indexOf(event_1) === -1) {
                toRemove.push(event_1);
            }
        }
        toRemove.forEach(this.removeListener, this);
        toAdd.forEach(this.addListener, this);
    };
    GlobalEventListener.prototype.addListener = function (event) {
        var useCapture = event === "scroll";
        window.addEventListener(event, this["on" + string_1.firstUp(event)], useCapture);
    };
    GlobalEventListener.prototype.removeListener = function (event) {
        window.removeEventListener(event, this["on" + string_1.firstUp(event)]);
    };
    GlobalEventListener.prototype.render = function () {
        return null;
    };
    return GlobalEventListener;
}(React.Component));
exports.GlobalEventListener = GlobalEventListener;
//# sourceMappingURL=global-event-listener.js.map