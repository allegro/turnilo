"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chronoshift_1 = require("chronoshift");
function isValidDuration(input) {
    try {
        chronoshift_1.Duration.fromJS(input);
        return true;
    }
    catch (_a) {
        return false;
    }
}
exports.isValidDuration = isValidDuration;
function isFloorableDuration(input) {
    try {
        return chronoshift_1.Duration.fromJS(input).isFloorable();
    }
    catch (_a) {
        return false;
    }
}
exports.isFloorableDuration = isFloorableDuration;
//# sourceMappingURL=duration.js.map