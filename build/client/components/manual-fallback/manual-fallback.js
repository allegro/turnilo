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
var essence_1 = require("../../../common/models/essence/essence");
var message_card_1 = require("../message-card/message-card");
require("./manual-fallback.scss");
var ManualFallback = (function (_super) {
    __extends(ManualFallback, _super);
    function ManualFallback() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ManualFallback.prototype.onResolutionClick = function (resolution) {
        var clicker = this.props.clicker;
        var _a = resolution.adjustment, splits = _a.splits, series = _a.series;
        if (series != null) {
            clicker.changeSeriesList(series);
        }
        if (splits != null) {
            clicker.changeSplits(splits, essence_1.VisStrategy.KeepAlways);
        }
    };
    ManualFallback.prototype.render = function () {
        var _this = this;
        var essence = this.props.essence;
        var visResolve = essence.visResolve;
        if (!visResolve.isManual())
            return null;
        var resolutionItems = visResolve.resolutions.map(function (resolution, i) {
            return React.createElement("li", { className: "resolution-item", key: i, onClick: _this.onResolutionClick.bind(_this, resolution) }, resolution.description);
        });
        return React.createElement(message_card_1.MessageCard, { title: visResolve.message },
            React.createElement("ul", { className: "manual-fallback" }, resolutionItems));
    };
    return ManualFallback;
}(React.Component));
exports.ManualFallback = ManualFallback;
//# sourceMappingURL=manual-fallback.js.map