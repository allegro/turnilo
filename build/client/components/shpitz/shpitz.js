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
require("./shpitz.scss");
var Shpitz = (function (_super) {
    __extends(Shpitz, _super);
    function Shpitz() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Shpitz.prototype.render = function () {
        var _a = this.props, direction = _a.direction, style = _a.style;
        return React.createElement("div", { className: dom_1.classNames("shpitz", direction), style: style },
            React.createElement("div", { className: "rectangle" }));
    };
    return Shpitz;
}(React.Component));
exports.Shpitz = Shpitz;
//# sourceMappingURL=shpitz.js.map