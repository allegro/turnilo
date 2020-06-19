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
require("./golden-center.scss");
var GoldenCenter = (function (_super) {
    __extends(GoldenCenter, _super);
    function GoldenCenter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            top: 0
        };
        _this.globalResizeListener = function () {
            var myNode = ReactDOM.findDOMNode(_this);
            if (!myNode)
                return;
            var childNode = myNode.firstChild;
            if (!childNode)
                return;
            var myRect = myNode.getBoundingClientRect();
            var childRect = childNode.getBoundingClientRect();
            var _a = _this.props, topRatio = _a.topRatio, minPadding = _a.minPadding;
            var top = Math.max((myRect.height - childRect.height) * topRatio, minPadding);
            _this.setState({ top: top });
        };
        return _this;
    }
    GoldenCenter.prototype.componentDidMount = function () {
        window.addEventListener("resize", this.globalResizeListener);
        this.globalResizeListener();
    };
    GoldenCenter.prototype.componentWillUnmount = function () {
        window.removeEventListener("resize", this.globalResizeListener);
    };
    GoldenCenter.prototype.render = function () {
        var _a = this.props, minPadding = _a.minPadding, children = _a.children;
        var top = this.state.top;
        return React.createElement("div", { className: "golden-center", style: { paddingTop: top, paddingBottom: minPadding } }, React.Children.only(children));
    };
    GoldenCenter.defaultProps = {
        topRatio: 0.618 / 1.618,
        minPadding: 50
    };
    return GoldenCenter;
}(React.Component));
exports.GoldenCenter = GoldenCenter;
//# sourceMappingURL=golden-center.js.map