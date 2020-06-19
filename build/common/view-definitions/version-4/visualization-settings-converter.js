"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function fromViewDefinition(visualization, settings) {
    var _a = visualization.visualizationSettings, read = _a.converter.read, defaults = _a.defaults;
    return settings ? read(settings) : defaults;
}
exports.fromViewDefinition = fromViewDefinition;
function toViewDefinition(visualization, settings) {
    var print = visualization.visualizationSettings.converter.print;
    return print(settings);
}
exports.toViewDefinition = toViewDefinition;
//# sourceMappingURL=visualization-settings-converter.js.map