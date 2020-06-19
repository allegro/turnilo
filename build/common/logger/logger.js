"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var functional_1 = require("../utils/functional/functional");
exports.LOGGER = {
    error: console.error.bind(console),
    warn: console.warn.bind(console),
    log: console.log.bind(console)
};
exports.NULL_LOGGER = {
    error: functional_1.noop,
    warn: functional_1.noop,
    log: functional_1.noop
};
//# sourceMappingURL=logger.js.map