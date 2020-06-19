"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_1 = require("immutable");
var defaults = {
    collapseRows: false
};
var settingsFactory = immutable_1.Record(defaults);
var createSettings = function (settings) { return new (settingsFactory)(settings); };
exports.settings = {
    converter: {
        print: function (settings) { return settings.toJS(); },
        read: function (input) { return createSettings({ collapseRows: !!input.collapseRows }); }
    },
    defaults: createSettings({})
};
//# sourceMappingURL=settings.js.map