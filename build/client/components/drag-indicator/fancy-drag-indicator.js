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
var constants_1 = require("../../config/constants");
var svg_icon_1 = require("../svg-icon/svg-icon");
require("./fancy-drag-indicator.scss");
var FancyDragIndicator = (function (_super) {
    __extends(FancyDragIndicator, _super);
    function FancyDragIndicator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FancyDragIndicator.prototype.render = function () {
        var dragPosition = this.props.dragPosition;
        if (!dragPosition)
            return null;
        var sectionWidth = constants_1.CORE_ITEM_WIDTH + constants_1.CORE_ITEM_GAP;
        var ghostArrowLeft;
        var dragGhostElement = null;
        if (dragPosition.isInsert()) {
            ghostArrowLeft = dragPosition.insert * sectionWidth - constants_1.CORE_ITEM_GAP / 2;
        }
        else {
            ghostArrowLeft = dragPosition.replace * sectionWidth + constants_1.CORE_ITEM_WIDTH / 2;
            var left = dragPosition.replace * sectionWidth;
            dragGhostElement = React.createElement("div", { className: "drag-ghost-element", style: { left: left } });
        }
        return React.createElement("div", { className: "fancy-drag-indicator" },
            dragGhostElement,
            React.createElement(svg_icon_1.SvgIcon, { className: "drag-ghost-arrow", svg: require("../../icons/drag-arrow.svg"), style: { left: ghostArrowLeft } }));
    };
    return FancyDragIndicator;
}(React.Component));
exports.FancyDragIndicator = FancyDragIndicator;
//# sourceMappingURL=fancy-drag-indicator.js.map