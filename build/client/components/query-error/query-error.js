"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var constants_1 = require("../../config/constants");
var message_1 = require("../message/message");
exports.QueryError = function (_a) {
    var error = _a.error;
    return React.createElement(message_1.Message, { level: "error", content: error.message, title: constants_1.STRINGS.queryError });
};
//# sourceMappingURL=query-error.js.map