"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var formatter_1 = require("../../../../../common/utils/formatter/formatter");
var highlight_modal_1 = require("../../../../components/highlight-modal/highlight-modal");
var highlight_clause_1 = require("../../interactions/highlight-clause");
exports.HighlightModal = function (props) {
    var _a = props.rect, left = _a.left, top = _a.top, interaction = props.interaction, timezone = props.timezone, dropHighlight = props.dropHighlight, acceptHighlight = props.acceptHighlight, xScale = props.xScale;
    var range = highlight_clause_1.toPlywoodRange(interaction.clause);
    var x = xScale(range.midpoint());
    return React.createElement(highlight_modal_1.HighlightModal, { title: formatter_1.formatValue(range, timezone), left: left + x, top: top + 80, dropHighlight: dropHighlight, acceptHighlight: acceptHighlight });
};
//# sourceMappingURL=highlight-modal.js.map