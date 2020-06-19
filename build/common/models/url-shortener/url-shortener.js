"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UrlShortener = (function () {
    function UrlShortener(shortenerDefinition) {
        this.shortenerDefinition = shortenerDefinition;
        this.shortenerFunction = new Function("url", "request", shortenerDefinition);
    }
    UrlShortener.fromJS = function (definition) {
        return new UrlShortener(definition);
    };
    UrlShortener.prototype.toJS = function () {
        return this.shortenerDefinition;
    };
    UrlShortener.prototype.valueOf = function () {
        return this.shortenerDefinition;
    };
    UrlShortener.prototype.toJSON = function () {
        return this.toJS();
    };
    UrlShortener.prototype.equals = function (other) {
        return other instanceof UrlShortener && this.valueOf() === other.valueOf();
    };
    UrlShortener.prototype.toString = function () {
        return this.shortenerDefinition;
    };
    return UrlShortener;
}());
exports.UrlShortener = UrlShortener;
//# sourceMappingURL=url-shortener.js.map