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
require("./body-portal.scss");
var normalize_styles_1 = require("./normalize-styles");
var BodyPortal = (function (_super) {
    __extends(BodyPortal, _super);
    function BodyPortal(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            isAttached: false
        };
        _this.target = null;
        _this.target = document.createElement("div");
        _this.target.className = dom_1.classNames("body-portal", { "full-size": props.fullSize });
        return _this;
    }
    BodyPortal.prototype.componentDidMount = function () {
        document.body.appendChild(this.target);
        this.setState({ isAttached: true });
        var _a = this.props, onMount = _a.onMount, isAboveAll = _a.isAboveAll;
        if (onMount)
            onMount();
        if (isAboveAll) {
            if (BodyPortal.aboveAll)
                throw new Error("There can be only one");
            BodyPortal.aboveAll = this;
        }
    };
    BodyPortal.prototype.componentWillUnmount = function () {
        document.body.removeChild(this.target);
        if (BodyPortal.aboveAll === this)
            BodyPortal.aboveAll = undefined;
    };
    BodyPortal.prototype.render = function () {
        var isAttached = this.state.isAttached;
        Object.assign(this.target.style, normalize_styles_1.default(this.props));
        return ReactDOM.createPortal(isAttached && this.props.children, this.target);
    };
    BodyPortal.defaultProps = {
        disablePointerEvents: false,
        isAboveAll: false
    };
    return BodyPortal;
}(React.Component));
exports.BodyPortal = BodyPortal;
//# sourceMappingURL=body-portal.js.map