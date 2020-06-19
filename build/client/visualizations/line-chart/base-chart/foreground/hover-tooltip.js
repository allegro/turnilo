"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var formatter_1 = require("../../../../../common/utils/formatter/formatter");
var segment_bubble_1 = require("../../../../components/segment-bubble/segment-bubble");
var tooltip_within_stage_1 = require("../../../../components/tooltip-within-stage/tooltip-within-stage");
exports.HoverTooltip = function (props) {
    var content = props.content, interaction = props.interaction, xScale = props.xScale, timezone = props.timezone, stage = props.stage;
    var range = interaction.range;
    var x = xScale(range.midpoint());
    return React.createElement(tooltip_within_stage_1.TooltipWithinStage, { key: x, top: 60, left: x, stage: stage },
        React.createElement(segment_bubble_1.SegmentBubbleContent, { title: formatter_1.formatValue(range, timezone), content: content }));
};
//# sourceMappingURL=hover-tooltip.js.map