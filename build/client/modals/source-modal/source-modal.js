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
var react_syntax_highlighter_1 = require("react-syntax-highlighter");
var hljs_1 = require("react-syntax-highlighter/styles/hljs");
var button_1 = require("../../components/button/button");
var modal_1 = require("../../components/modal/modal");
var safe_copy_to_clipboard_1 = require("../../components/safe-copy-to-clipboard/safe-copy-to-clipboard");
var constants_1 = require("../../config/constants");
var dom_1 = require("../../utils/dom/dom");
require("./source-modal.scss");
var SourceModal = (function (_super) {
    __extends(SourceModal, _super);
    function SourceModal() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { copied: false };
        _this.onCopy = function () { return _this.setState({ copied: true }); };
        return _this;
    }
    SourceModal.prototype.render = function () {
        var _a = this.props, _b = _a.copyLabel, copyLabel = _b === void 0 ? constants_1.STRINGS.copyDefinition : _b, onClose = _a.onClose, source = _a.source, title = _a.title, className = _a.className, header = _a.header;
        return React.createElement(modal_1.Modal, { onClose: onClose, title: title, className: dom_1.classNames("source-modal", className) },
            React.createElement("div", { className: "content" },
                header,
                React.createElement(react_syntax_highlighter_1.default, { className: "source-modal__source", language: "json", style: hljs_1.githubGist }, source),
                React.createElement("div", { className: "button-bar" },
                    React.createElement(button_1.Button, { type: "primary", className: "close", onClick: onClose, title: constants_1.STRINGS.close }),
                    React.createElement(safe_copy_to_clipboard_1.SafeCopyToClipboard, { text: source, onCopy: this.onCopy },
                        React.createElement(button_1.Button, { type: "secondary", title: copyLabel })),
                    this.state.copied && React.createElement("div", { className: "copied-hint" }, constants_1.STRINGS.copied))));
    };
    return SourceModal;
}(React.Component));
exports.SourceModal = SourceModal;
//# sourceMappingURL=source-modal.js.map