"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InteractionKind;
(function (InteractionKind) {
    InteractionKind[InteractionKind["HOVER"] = 0] = "HOVER";
    InteractionKind[InteractionKind["DRAGGING"] = 1] = "DRAGGING";
    InteractionKind[InteractionKind["HIGHLIGHT"] = 2] = "HIGHLIGHT";
})(InteractionKind || (InteractionKind = {}));
exports.createHover = function (key, range) { return ({
    kind: InteractionKind.HOVER,
    range: range,
    key: key
}); };
exports.isHover = function (interaction) { return interaction && interaction.kind === InteractionKind.HOVER; };
exports.createDragging = function (key, start, end) { return ({
    kind: InteractionKind.DRAGGING,
    start: start,
    end: end,
    key: key
}); };
exports.isDragging = function (interaction) { return interaction && interaction.kind === InteractionKind.DRAGGING; };
exports.createHighlight = function (highlight) { return ({
    kind: InteractionKind.HIGHLIGHT,
    clause: highlight.clauses.first(),
    key: highlight.key
}); };
exports.isHighlight = function (interaction) { return interaction && interaction.kind === InteractionKind.HIGHLIGHT; };
//# sourceMappingURL=interaction.js.map