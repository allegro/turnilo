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
function createTeleporter() {
    var context = {};
    function saveTarget(node) {
        context.node = node;
        if (context.notify) {
            context.notify(node);
        }
    }
    var Target = function () { return React.createElement("div", { ref: saveTarget }); };
    var Source = (function (_super) {
        __extends(Source, _super);
        function Source() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.state = { node: null };
            return _this;
        }
        Source.prototype.componentDidMount = function () {
            var _this = this;
            if (context.node) {
                this.setState({ node: context.node });
            }
            context.notify = function (node) { return _this.setState({ node: node }); };
        };
        Source.prototype.componentWillUnmount = function () {
            context.notify = undefined;
        };
        Source.prototype.render = function () {
            var node = this.state.node;
            if (!node)
                return null;
            return ReactDOM.createPortal(this.props.children, node);
        };
        return Source;
    }(React.Component));
    return { Source: Source, Target: Target };
}
exports.createTeleporter = createTeleporter;
//# sourceMappingURL=teleporter.js.map