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
var stage_1 = require("../../../common/models/stage/stage");
var string_1 = require("../../../common/utils/string/string");
var dom_1 = require("../../utils/dom/dom");
require("./scroller.scss");
var Scroller = (function (_super) {
    __extends(Scroller, _super);
    function Scroller(props) {
        var _this = _super.call(this, props) || this;
        _this.container = React.createRef();
        _this.scroller = React.createRef();
        _this.globalResizeListener = function () {
            _this.updateViewport();
        };
        _this.onScroll = function (e) {
            var _a = _this.props.layout, bodyWidth = _a.bodyWidth, bodyHeight = _a.bodyHeight;
            var _b = _this.state, viewportWidth = _b.viewportWidth, viewportHeight = _b.viewportHeight;
            var target = e.target;
            var scrollLeft = dom_1.clamp(target.scrollLeft, 0, Math.max(bodyWidth - viewportWidth, 0));
            var scrollTop = dom_1.clamp(target.scrollTop, 0, Math.max(bodyHeight - viewportHeight, 0));
            if (_this.props.onScroll !== undefined) {
                _this.setState({
                    scrollTop: scrollTop,
                    scrollLeft: scrollLeft
                }, function () { return _this.props.onScroll(scrollTop, scrollLeft); });
            }
            else {
                _this.setState({
                    scrollTop: scrollTop,
                    scrollLeft: scrollLeft
                });
            }
        };
        _this.onClick = function (event) {
            if (_this.props.onClick === undefined)
                return;
            var _a = _this.getRelativeMouseCoordinates(event), x = _a.x, y = _a.y, part = _a.part;
            if (y < 0 || x < 0)
                return;
            _this.props.onClick(x, y, part);
        };
        _this.onMouseMove = function (event) {
            if (_this.props.onMouseMove === undefined)
                return;
            var _a = _this.getRelativeMouseCoordinates(event), x = _a.x, y = _a.y, part = _a.part;
            if (y < 0 || x < 0)
                return;
            _this.props.onMouseMove(x, y, part);
        };
        _this.state = {
            scrollTop: 0,
            scrollLeft: 0,
            viewportHeight: 0,
            viewportWidth: 0
        };
        return _this;
    }
    Scroller.prototype.getGutterStyle = function (side) {
        var layout = this.props.layout;
        var _a = this.state, scrollLeft = _a.scrollLeft, scrollTop = _a.scrollTop;
        switch (side) {
            case "top":
                return {
                    height: layout.top,
                    left: layout.left - scrollLeft,
                    right: layout.right
                };
            case "right":
                return {
                    width: layout.right,
                    right: 0,
                    top: layout.top - scrollTop,
                    bottom: layout.bottom
                };
            case "bottom":
                return {
                    height: layout.bottom,
                    left: layout.left - scrollLeft,
                    right: layout.right,
                    bottom: 0
                };
            case "left":
                return {
                    width: layout.left,
                    left: 0,
                    top: layout.top - scrollTop,
                    bottom: layout.bottom
                };
            default:
                throw new Error("Unknown side for gutter. This shouldn't happen.");
        }
    };
    Scroller.prototype.getCornerStyle = function (yPos, xPos) {
        var layout = this.props.layout;
        var style = {};
        if (xPos === "left") {
            style.left = 0;
            style.width = layout.left;
        }
        else {
            style.right = 0;
            style.width = layout.right;
        }
        if (yPos === "top") {
            style.top = 0;
            style.height = layout.top;
        }
        else {
            style.height = layout.bottom;
            style.bottom = 0;
        }
        return style;
    };
    Scroller.prototype.getShadowStyle = function (side) {
        var layout = this.props.layout;
        switch (side) {
            case "top":
                return { top: 0, height: layout.top, left: 0, right: 0 };
            case "right":
                return { width: layout.right, right: 0, top: 0, bottom: 0 };
            case "bottom":
                return { height: layout.bottom, bottom: 0, left: 0, right: 0 };
            case "left":
                return { width: layout.left, left: 0, top: 0, bottom: 0 };
            default:
                throw new Error("Unknown side for shadow. This shouldn't happen.");
        }
    };
    Scroller.prototype.getBodyStyle = function () {
        var layout = this.props.layout;
        var _a = this.state, scrollTop = _a.scrollTop, scrollLeft = _a.scrollLeft;
        return {
            top: layout.top - scrollTop,
            right: layout.right,
            bottom: layout.bottom,
            left: layout.left - scrollLeft
        };
    };
    Scroller.prototype.getTargetStyle = function () {
        var layout = this.props.layout;
        return {
            width: layout.bodyWidth + layout.left + layout.right,
            height: layout.bodyHeight + layout.top + layout.bottom
        };
    };
    Scroller.prototype.getRelativeMouseCoordinates = function (event) {
        var _a = this.props.layout, top = _a.top, left = _a.left, bodyWidth = _a.bodyWidth, bodyHeight = _a.bodyHeight;
        var container = this.container.current;
        var _b = this.state, scrollLeft = _b.scrollLeft, scrollTop = _b.scrollTop, viewportHeight = _b.viewportHeight, viewportWidth = _b.viewportWidth;
        var rect = container.getBoundingClientRect();
        var i = 0;
        var j = 0;
        var x = dom_1.getXFromEvent(event) - rect.left;
        var y = dom_1.getYFromEvent(event) - rect.top;
        if (x > left && x <= left + viewportWidth) {
            j = 1;
            x += scrollLeft;
        }
        else if (x > left + viewportWidth) {
            j = 2;
            x += bodyWidth - viewportWidth;
        }
        if (y > top && y <= top + viewportHeight) {
            i = 1;
            y += scrollTop;
        }
        else if (y > top + viewportHeight) {
            i = 2;
            y += bodyHeight - viewportHeight;
        }
        return { x: x, y: y, part: Scroller.PARTS[i][j] };
    };
    Scroller.prototype.renderGutter = function (side) {
        var element = this.props[side + "Gutter"];
        if (!element)
            return null;
        return React.createElement("div", { className: side + "-gutter", style: this.getGutterStyle(side) }, element);
    };
    Scroller.prototype.shouldHaveShadow = function (side) {
        var layout = this.props.layout;
        var _a = this.state, scrollLeft = _a.scrollLeft, scrollTop = _a.scrollTop, viewportHeight = _a.viewportHeight, viewportWidth = _a.viewportWidth;
        if (side === "top")
            return scrollTop > 0;
        if (side === "left")
            return scrollLeft > 0;
        if (side === "bottom")
            return layout.bodyHeight - scrollTop > viewportHeight;
        if (side === "right")
            return layout.bodyWidth - scrollLeft > viewportWidth;
        throw new Error("Unknown side for shadow : " + side);
    };
    Scroller.prototype.renderShadow = function (side) {
        if (!this.props.layout[side])
            return null;
        if (!this.shouldHaveShadow(side))
            return null;
        return React.createElement("div", { className: side + "-shadow", style: this.getShadowStyle(side) });
    };
    Scroller.prototype.renderCorner = function (yPos, xPos) {
        var style = this.getCornerStyle(yPos, xPos);
        var element = this.props[yPos + string_1.firstUp(xPos) + "Corner"];
        if (!element)
            return null;
        return React.createElement("div", { className: [yPos, xPos, "corner"].join("-"), style: style }, element);
    };
    Scroller.prototype.componentDidMount = function () {
        window.addEventListener("resize", this.globalResizeListener);
        this.updateViewport();
    };
    Scroller.prototype.componentWillUnmount = function () {
        window.removeEventListener("resize", this.globalResizeListener);
    };
    Scroller.prototype.componentDidUpdate = function () {
        this.updateViewport();
    };
    Scroller.prototype.updateViewport = function () {
        var scroller = this.scroller.current;
        if (!scroller)
            return;
        var rect = scroller.getBoundingClientRect();
        var _a = this.props.layout, top = _a.top, right = _a.right, bottom = _a.bottom, left = _a.left;
        var newHeight = rect.height - top - bottom;
        var newWidth = rect.width - left - right;
        if (this.state.viewportHeight !== newHeight || this.state.viewportWidth !== newWidth) {
            this.setState({ viewportHeight: newHeight, viewportWidth: newWidth });
            var x = rect.left, y = rect.top;
            var onViewportUpdate = this.props.onViewportUpdate;
            onViewportUpdate && onViewportUpdate(new stage_1.Stage({ x: x, y: y, width: newWidth, height: newHeight }));
        }
    };
    Scroller.prototype.render = function () {
        var _a = this.state, viewportWidth = _a.viewportWidth, viewportHeight = _a.viewportHeight;
        var _b = this.props, body = _b.body, overlay = _b.overlay, onMouseLeave = _b.onMouseLeave, layout = _b.layout;
        if (!layout)
            return null;
        var bodyWidth = layout.bodyWidth, bodyHeight = layout.bodyHeight;
        var blockHorizontalScroll = bodyWidth <= viewportWidth;
        var blockVerticalScroll = bodyHeight <= viewportHeight;
        var eventContainerClasses = dom_1.classNames("event-container", {
            "no-x-scroll": blockHorizontalScroll,
            "no-y-scroll": blockVerticalScroll
        });
        var scrollerClasses = dom_1.classNames("scroller", {
            "has-top-shadow": this.shouldHaveShadow("top")
        });
        return React.createElement("div", { className: scrollerClasses, ref: this.scroller },
            React.createElement("div", { className: "body", style: this.getBodyStyle() }, body),
            this.renderGutter("top"),
            this.renderGutter("right"),
            this.renderGutter("bottom"),
            this.renderGutter("left"),
            this.renderCorner("top", "left"),
            this.renderCorner("top", "right"),
            this.renderCorner("bottom", "left"),
            this.renderCorner("bottom", "right"),
            this.renderShadow("top"),
            this.renderShadow("right"),
            this.renderShadow("bottom"),
            this.renderShadow("left"),
            overlay ? React.createElement("div", { className: "overlay" }, overlay) : null,
            React.createElement("div", { className: eventContainerClasses, ref: this.container, onScroll: this.onScroll, onClick: this.onClick, onMouseMove: this.onMouseMove, onMouseLeave: onMouseLeave || null },
                React.createElement("div", { className: "event-target", style: this.getTargetStyle() })));
    };
    Scroller.TOP_LEFT_CORNER = "top-left-corner";
    Scroller.TOP_GUTTER = "top-gutter";
    Scroller.TOP_RIGHT_CORNER = "top-right-corner";
    Scroller.LEFT_GUTTER = "left-gutter";
    Scroller.BODY = "body";
    Scroller.RIGHT_GUTTER = "right-gutter";
    Scroller.BOTTOM_LEFT_CORNER = "bottom-left-corner";
    Scroller.BOTTOM_GUTTER = "bottom-gutter";
    Scroller.BOTTOM_RIGHT_CORNER = "bottom-right-corner";
    Scroller.PARTS = [
        [Scroller.TOP_LEFT_CORNER, Scroller.TOP_GUTTER, Scroller.TOP_RIGHT_CORNER],
        [Scroller.LEFT_GUTTER, Scroller.BODY, Scroller.RIGHT_GUTTER],
        [Scroller.BOTTOM_LEFT_CORNER, Scroller.BOTTOM_GUTTER, Scroller.BOTTOM_RIGHT_CORNER]
    ];
    return Scroller;
}(React.Component));
exports.Scroller = Scroller;
//# sourceMappingURL=scroller.js.map