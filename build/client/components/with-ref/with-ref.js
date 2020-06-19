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
var WithRef = (function (_super) {
    __extends(WithRef, _super);
    function WithRef() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {};
        _this.setRef = function (ref) { return _this.setState({ ref: ref }); };
        return _this;
    }
    WithRef.prototype.render = function () {
        var setRef = this.setRef;
        var ref = this.state.ref;
        return this.props.children({ ref: ref, setRef: setRef });
    };
    return WithRef;
}(React.Component));
exports.WithRef = WithRef;
//# sourceMappingURL=with-ref.js.map