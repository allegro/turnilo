"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var interaction_1 = require("../../interactions/interaction");
var highlight_modal_1 = require("./highlight-modal");
var hover_tooltip_1 = require("./hover-tooltip");
var selection_overlay_1 = require("./selection-overlay");
exports.Foreground = function (props) {
    var stage = props.stage, interaction = props.interaction, container = props.container, xScale = props.xScale, timezone = props.timezone, visualisationStage = props.visualisationStage, hoverContent = props.hoverContent, dropHighlight = props.dropHighlight, acceptHighlight = props.acceptHighlight;
    return React.createElement(React.Fragment, null,
        React.createElement(selection_overlay_1.SelectionOverlay, { stage: stage, interaction: interaction, timezone: timezone, xScale: xScale }),
        interaction_1.isHover(interaction) && React.createElement(hover_tooltip_1.HoverTooltip, { stage: visualisationStage, interaction: interaction, xScale: xScale, content: hoverContent, timezone: timezone }),
        interaction_1.isHighlight(interaction) && React.createElement(highlight_modal_1.HighlightModal, { rect: container.current.getBoundingClientRect(), interaction: interaction, xScale: xScale, timezone: timezone, dropHighlight: dropHighlight, acceptHighlight: acceptHighlight }));
};
//# sourceMappingURL=foreground.js.map