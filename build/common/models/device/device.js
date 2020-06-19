"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DeviceSize;
(function (DeviceSize) {
    DeviceSize["SMALL"] = "small";
    DeviceSize["MEDIUM"] = "medium";
    DeviceSize["LARGE"] = "large";
})(DeviceSize = exports.DeviceSize || (exports.DeviceSize = {}));
var Device = (function () {
    function Device() {
    }
    Device.getSize = function () {
        if (window.innerWidth <= 1080)
            return DeviceSize.SMALL;
        if (window.innerWidth <= 1250)
            return DeviceSize.MEDIUM;
        return DeviceSize.LARGE;
    };
    return Device;
}());
exports.Device = Device;
//# sourceMappingURL=device.js.map