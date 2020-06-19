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
var calculate_position_1 = require("./calculate-position");
require("./tooltip-within-stage.scss");
var TooltipWithinStage = (function (_super) {
    __extends(TooltipWithinStage, _super);
    function TooltipWithinStage() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.self = React.createRef();
        _this.state = {};
        return _this;
    }
    TooltipWithinStage.prototype.componentDidMount = function () {
        this.setState({
            rect: this.self.current.getBoundingClientRect()
        });
    };
    TooltipWithinStage.prototype.render = function () {
        var children = this.props.children;
        return React.createElement("div", { className: "tooltip-within-stage", style: calculate_position_1.calculatePosition(this.props, this.state.rect), ref: this.self }, children);
    };
    return TooltipWithinStage;
}(React.Component));
exports.TooltipWithinStage = TooltipWithinStage;
//# sourceMappingURL=tooltip-within-stage.js.map