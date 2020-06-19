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
var modal_1 = require("../../components/modal/modal");
var safe_copy_to_clipboard_1 = require("../../components/safe-copy-to-clipboard/safe-copy-to-clipboard");
var constants_1 = require("../../config/constants");
require("./url-shortener-modal.scss");
exports.UrlShortenerModal = function (_a) {
    var title = _a.title, onClose = _a.onClose, url = _a.url;
    return React.createElement(modal_1.Modal, { className: "short-url-modal", title: title, onClose: onClose },
        React.createElement(UrlShortenerPrompt, { url: url }));
};
var UrlShortenerPrompt = (function (_super) {
    __extends(UrlShortenerPrompt, _super);
    function UrlShortenerPrompt() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { shortUrl: null };
        return _this;
    }
    UrlShortenerPrompt.prototype.componentDidMount = function () {
        var _this = this;
        this.shortenUrl()
            .then(function (_a) {
            var shortUrl = _a.shortUrl;
            _this.setState({ shortUrl: shortUrl });
        })
            .catch(function () {
            _this.setState({ error: "Couldn't create short link" });
        });
    };
    UrlShortenerPrompt.prototype.shortenUrl = function () {
        return fetch("shorten?url=" + encodeURIComponent(this.props.url))
            .then(function (response) { return response.json(); });
    };
    UrlShortenerPrompt.prototype.renderShortUrl = function () {
        var _a = this.state, shortUrl = _a.shortUrl, error = _a.error;
        if (error)
            return error;
        if (!shortUrl)
            return constants_1.STRINGS.loading;
        return React.createElement(ShortUrl, { url: shortUrl });
    };
    UrlShortenerPrompt.prototype.render = function () {
        return React.createElement(React.Fragment, null,
            React.createElement("div", { className: "url-shortener" }, this.renderShortUrl()),
            React.createElement(LongUrl, { url: this.props.url }));
    };
    return UrlShortenerPrompt;
}(React.Component));
exports.UrlShortenerPrompt = UrlShortenerPrompt;
var ShortUrl = (function (_super) {
    __extends(ShortUrl, _super);
    function ShortUrl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { copied: false };
        _this.copiedUrl = function () { return _this.setState({ copied: true }); };
        return _this;
    }
    ShortUrl.prototype.render = function () {
        var url = this.props.url;
        return React.createElement("div", null,
            React.createElement("div", { className: "url-group" },
                React.createElement("input", { className: "short-url", readOnly: true, value: url }),
                React.createElement(safe_copy_to_clipboard_1.SafeCopyToClipboard, { text: url, onCopy: this.copiedUrl },
                    React.createElement("button", { className: "copy-button" }, "Copy"))),
            this.state.copied && React.createElement("div", { className: "copied-hint" }, constants_1.STRINGS.copied));
    };
    return ShortUrl;
}(React.Component));
exports.ShortUrl = ShortUrl;
var LongUrl = (function (_super) {
    __extends(LongUrl, _super);
    function LongUrl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { copied: false };
        _this.copiedUrl = function () { return _this.setState({ copied: true }); };
        return _this;
    }
    LongUrl.prototype.render = function () {
        return React.createElement("div", { className: "url-notice" },
            "Please note that, this url may expire in the future. You still can\u00A0",
            React.createElement(safe_copy_to_clipboard_1.SafeCopyToClipboard, { text: this.props.url, onCopy: this.copiedUrl },
                React.createElement("span", { className: "copy-action" }, "copy full url")),
            "\u00A0instead.\u00A0",
            this.state.copied && React.createElement("span", { className: "copied-hint" }, constants_1.STRINGS.copied));
    };
    return LongUrl;
}(React.Component));
exports.LongUrl = LongUrl;
//# sourceMappingURL=url-shortener-modal.js.map