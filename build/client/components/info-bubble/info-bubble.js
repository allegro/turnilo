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
var dom_1 = require("../../utils/dom/dom");
var bubble_menu_1 = require("../bubble-menu/bubble-menu");
var markdown_node_1 = require("../markdown-node/markdown-node");
var svg_icon_1 = require("../svg-icon/svg-icon");
require("./info-bubble.scss");
var defaultIcon = require("../../icons/info.svg");
var defaultTitle = "More info";
var BUBBLE_MAX_VERTICAL_SPACE = 120;
var InfoBubble = (function (_super) {
    __extends(InfoBubble, _super);
    function InfoBubble(props) {
        var _this = _super.call(this, props) || this;
        _this.showDescription = function (_a) {
            var currentTarget = _a.currentTarget;
            var willBubbleFit = currentTarget.getBoundingClientRect().top > BUBBLE_MAX_VERTICAL_SPACE;
            var direction = willBubbleFit ? "up" : "down";
            _this.setState({ showInfo: { target: currentTarget, direction: direction } });
        };
        _this.closeDescription = function () {
            _this.setState({ showInfo: null });
        };
        _this.state = { showInfo: null };
        return _this;
    }
    InfoBubble.prototype.render = function () {
        var showInfo = this.state.showInfo;
        var _a = this.props, description = _a.description, icon = _a.icon, className = _a.className, title = _a.title;
        return React.createElement(React.Fragment, null,
            React.createElement("div", { className: dom_1.classNames("info-button", className), title: title || defaultTitle, onClick: this.showDescription },
                React.createElement(svg_icon_1.SvgIcon, { svg: icon || defaultIcon })),
            showInfo && React.createElement(bubble_menu_1.BubbleMenu, { className: "description-menu", direction: showInfo.direction, onClose: this.closeDescription, stage: stage_1.Stage.fromSize(300, 200), openOn: showInfo.target },
                React.createElement(markdown_node_1.MarkdownNode, { markdown: description })));
    };
    return InfoBubble;
}(React.Component));
exports.InfoBubble = InfoBubble;
//# sourceMappingURL=info-bubble.js.map