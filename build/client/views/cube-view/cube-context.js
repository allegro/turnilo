"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
exports.CubeContext = React.createContext({
    get essence() {
        throw new Error("Attempted to consume CubeContext when there was no Provider in place.");
    },
    get clicker() {
        throw new Error("Attempted to consume CubeContext when there was no Provider in place.");
    }
});
//# sourceMappingURL=cube-context.js.map