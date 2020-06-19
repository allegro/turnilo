"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var url_shortener_1 = require("./url-shortener");
exports.FailUrlShortenerJS = "return Promise.reject(new Error('error message'));";
exports.FailUrlShortener = new url_shortener_1.UrlShortener(exports.FailUrlShortenerJS);
exports.SuccessUrlShortenerJS = "return Promise.resolve('http://foobar');";
exports.SuccessUrlShortener = new url_shortener_1.UrlShortener(exports.SuccessUrlShortenerJS);
//# sourceMappingURL=url-shortener.fixtures.js.map