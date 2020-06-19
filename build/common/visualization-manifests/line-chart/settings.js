"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_1 = require("immutable");
var defaults = {
    groupSeries: false
};
var settingsFactory = immutable_1.Record(defaults);
var createSettings = function (settings) { return new (settingsFactory)(settings); };
exports.settings = {
    converter: {
        print: function (settings) { return settings.toJS(); },
        read: function (input) { return createSettings({ groupSeries: !!input.groupSeries }); }
    },
    defaults: createSettings({})
};
//# sourceMappingURL=settings.js.map