"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var plywood_1 = require("plywood");
var plywood_druid_requester_1 = require("plywood-druid-requester");
var url_1 = require("url");
var functional_1 = require("../../../common/utils/functional/functional");
function httpToPlywoodProtocol(protocol) {
    if (protocol === "https:")
        return "tls";
    return "plain";
}
function defaultPort(protocol) {
    switch (protocol) {
        case "http:":
            return 80;
        case "https:":
            return 443;
        default:
            throw new Error("Unsupported protocol: " + protocol);
    }
}
function getHostAndProtocol(url) {
    var protocol = url.protocol, port = url.port, hostname = url.hostname;
    var plywoodProtocol = httpToPlywoodProtocol(protocol);
    return {
        protocol: plywoodProtocol,
        host: hostname + ":" + (port || defaultPort(protocol))
    };
}
function createDruidRequester(cluster, requestDecorator) {
    var _a = getHostAndProtocol(new url_1.URL(cluster.url)), host = _a.host, protocol = _a.protocol;
    var timeout = cluster.getTimeout();
    return plywood_druid_requester_1.druidRequesterFactory({ host: host, timeout: timeout, requestDecorator: requestDecorator, protocol: protocol });
}
function setRetryOptions(retry) {
    return function (requester) { return plywood_1.retryRequesterFactory({ requester: requester, retry: retry, delay: 500, retryOnTimeout: false }); };
}
function setVerbose(requester) {
    return plywood_1.verboseRequesterFactory({ requester: requester });
}
function setConcurrencyLimit(concurrentLimit) {
    return function (requester) { return plywood_1.concurrentLimitRequesterFactory({ requester: requester, concurrentLimit: concurrentLimit }); };
}
function properRequesterFactory(options) {
    var cluster = options.cluster, druidRequestDecorator = options.druidRequestDecorator, retry = options.retry, verbose = options.verbose, concurrentLimit = options.concurrentLimit;
    return functional_1.threadConditionally(createDruidRequester(cluster, druidRequestDecorator), retry && setRetryOptions(retry), verbose && setVerbose, concurrentLimit && setConcurrencyLimit(concurrentLimit));
}
exports.properRequesterFactory = properRequesterFactory;
//# sourceMappingURL=requester.js.map