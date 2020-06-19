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
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var stage_1 = require("../../../common/models/stage/stage");
var dom_1 = require("../../utils/dom/dom");
var body_portal_1 = require("../body-portal/body-portal");
var shpitz_1 = require("../shpitz/shpitz");
require("./bubble-menu.scss");
exports.OFFSET_H = 10;
exports.OFFSET_V = 0;
exports.SCREEN_OFFSET = 5;
function defaultStage() {
    return new stage_1.Stage({
        x: exports.SCREEN_OFFSET,
        y: exports.SCREEN_OFFSET,
        width: window.innerWidth - exports.SCREEN_OFFSET * 2,
        height: window.innerHeight - exports.SCREEN_OFFSET * 2
    });
}
function alignHorizontalInside(align, _a) {
    var left = _a.left, width = _a.width;
    switch (align) {
        case "center":
            return left + width / 2;
        case "start":
            return left;
        case "end":
            return left + width;
    }
}
function alignHorizontalOutside(align, x, width) {
    switch (align) {
        case "center":
            return x - width / 2;
        case "start":
            return x;
        case "end":
            return x - width;
    }
}
var BubbleMenu = (function (_super) {
    __extends(BubbleMenu, _super);
    function BubbleMenu() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            id: null
        };
        _this.globalMouseDownListener = function (e) {
            var _a = _this.props, onClose = _a.onClose, openOn = _a.openOn;
            var id = _this.state.id;
            var myElement = document.getElementById(id);
            if (!myElement)
                return;
            var target = e.target;
            if (dom_1.isInside(target, myElement) || dom_1.isInside(target, openOn))
                return;
            onClose();
        };
        _this.globalKeyDownListener = function (e) {
            if (!dom_1.escapeKey(e))
                return;
            var onClose = _this.props.onClose;
            onClose();
        };
        return _this;
    }
    BubbleMenu.prototype.componentDidMount = function () {
        var _a = this.props, alignOn = _a.alignOn, openOn = _a.openOn, id = _a.id;
        var rect = (alignOn || openOn).getBoundingClientRect();
        this.setState(__assign({ id: id || dom_1.uniqueId("bubble-menu-") }, this.calcBubbleCoordinates(rect)));
        window.addEventListener("mousedown", this.globalMouseDownListener);
        window.addEventListener("keydown", this.globalKeyDownListener);
    };
    BubbleMenu.prototype.componentWillUnmount = function () {
        window.removeEventListener("mousedown", this.globalMouseDownListener);
        window.removeEventListener("keydown", this.globalKeyDownListener);
    };
    BubbleMenu.prototype.calcBubbleCoordinates = function (rect) {
        var _a = this.props, direction = _a.direction, align = _a.align;
        switch (direction) {
            case "right":
                return {
                    x: rect.left + rect.width - exports.OFFSET_H,
                    y: rect.top + rect.height / 2
                };
            case "down":
                return {
                    x: alignHorizontalInside(align, rect),
                    y: rect.top + rect.height - exports.OFFSET_V
                };
            case "up":
                return {
                    x: alignHorizontalInside(align, rect),
                    y: window.innerHeight - rect.top - exports.OFFSET_V
                };
            default:
                throw new Error("unknown direction: '" + direction + "'");
        }
    };
    BubbleMenu.prototype.calcMenuPosition = function () {
        var _a = this.props, align = _a.align, direction = _a.direction, stage = _a.stage, containerStage = _a.containerStage;
        var _b = this.state, menuX = _b.x, menuY = _b.y;
        var menuHeight = stage.height, menuWidth = stage.width;
        var container = containerStage || defaultStage();
        var containerVerticalExtent = container.y + container.height - menuHeight;
        var containerHorizontalExtent = container.x + container.width - menuWidth;
        switch (direction) {
            case "right":
                var top_1 = menuY - menuHeight / 2;
                var clampedTop = dom_1.clamp(top_1, container.y, containerVerticalExtent);
                return {
                    top: clampedTop,
                    height: menuHeight,
                    left: menuX,
                    maxWidth: container.width
                };
            case "down": {
                var left = alignHorizontalOutside(align, menuX, menuWidth);
                var clampedLeft = dom_1.clamp(left, container.x, containerHorizontalExtent);
                return {
                    left: clampedLeft,
                    width: menuWidth,
                    top: menuY,
                    maxHeight: container.height
                };
            }
            case "up": {
                var left = alignHorizontalOutside(align, menuX, menuWidth);
                var clampedLeft = dom_1.clamp(left, container.x, containerHorizontalExtent);
                return {
                    left: clampedLeft,
                    width: menuWidth,
                    bottom: menuY,
                    maxHeight: container.height
                };
            }
            default:
                throw new Error("unknown direction: '" + direction + "'");
        }
    };
    BubbleMenu.prototype.calcShpitzPosition = function (menuStyle) {
        var _a = this.state, x = _a.x, y = _a.y;
        var direction = this.props.direction;
        var left = menuStyle.left, top = menuStyle.top;
        switch (direction) {
            case "right":
                return {
                    top: y - top,
                    left: 0
                };
            case "down":
                return {
                    left: x - left,
                    top: 0
                };
            case "up":
                return {
                    left: x - left,
                    bottom: 0
                };
            default:
                throw new Error("unknown direction: '" + direction + "'");
        }
    };
    BubbleMenu.prototype.getInsideId = function () {
        var inside = this.props.inside;
        if (!inside)
            return null;
        if (!inside.id)
            throw new Error("inside element must have id");
        return inside.id;
    };
    BubbleMenu.prototype.render = function () {
        var _a = this.props, className = _a.className, direction = _a.direction, stage = _a.stage, fixedSize = _a.fixedSize, layout = _a.layout, align = _a.align, children = _a.children;
        var id = this.state.id;
        var insideId = this.getInsideId();
        var menuCoordinates = this.calcMenuPosition();
        var hasShpitz = align === "center";
        var shpitzCoordinates = hasShpitz && this.calcShpitzPosition(menuCoordinates);
        var maxHeight = menuCoordinates.maxHeight, maxWidth = menuCoordinates.maxWidth, left = menuCoordinates.left, top = menuCoordinates.top, bottom = menuCoordinates.bottom, height = menuCoordinates.height, width = menuCoordinates.width;
        var menuSize = fixedSize ? { width: stage.width, height: stage.height } : { maxHeight: maxHeight, maxWidth: maxWidth, height: height, width: width };
        var myClass = dom_1.classNames("bubble-menu", direction, className, { mini: layout === "mini" });
        return React.createElement(body_portal_1.BodyPortal, { left: left, top: top, bottom: bottom },
            React.createElement("div", { className: myClass, id: id, "data-parent": insideId, style: menuSize },
                children,
                hasShpitz && React.createElement(shpitz_1.Shpitz, { style: shpitzCoordinates, direction: direction })));
    };
    BubbleMenu.defaultProps = {
        align: "center"
    };
    return BubbleMenu;
}(React.Component));
exports.BubbleMenu = BubbleMenu;
//# sourceMappingURL=bubble-menu.js.map