"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var plywood_1 = require("plywood");
var React = require("react");
var highlighter_1 = require("../../../../components/highlighter/highlighter");
var continuous_range_1 = require("../../interactions/continuous-range");
var interaction_1 = require("../../interactions/interaction");
var is_valid_clause_1 = require("../../utils/is-valid-clause");
function getHighlightRange(interaction, timezone) {
    if (interaction_1.isDragging(interaction)) {
        return continuous_range_1.constructRange(interaction.start, interaction.end, timezone);
    }
    if (interaction_1.isHighlight(interaction)) {
        var clause = interaction.clause;
        if (!is_valid_clause_1.isValidClause(clause)) {
            throw new Error("Expected FixedTime or Number Filter clause. Got: " + clause);
        }
        return plywood_1.Range.fromJS(clause.values.first());
    }
    return null;
}
exports.SelectionOverlay = function (props) {
    var stage = props.stage, timezone = props.timezone, interaction = props.interaction, xScale = props.xScale;
    var range = getHighlightRange(interaction, timezone);
    if (!range)
        return null;
    return React.createElement("div", { style: stage.getLeftTopWidthHeight() },
        React.createElement(highlighter_1.Highlighter, { highlightRange: range, scaleX: xScale }));
};
//# sourceMappingURL=selection-overlay.js.map