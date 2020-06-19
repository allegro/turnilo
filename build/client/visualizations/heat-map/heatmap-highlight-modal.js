"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var highlight_modal_1 = require("../../components/highlight-modal/highlight-modal");
var highlight_modal_position_1 = require("./utils/highlight-modal-position");
exports.HeatmapHighlightModal = function (props) {
    var title = props.title, children = props.children, acceptHighlight = props.acceptHighlight, dropHighlight = props.dropHighlight;
    return React.createElement(highlight_modal_1.HighlightModal, { title: title, left: highlight_modal_position_1.calculateLeft(props), top: highlight_modal_position_1.calculateTop(props), dropHighlight: dropHighlight, acceptHighlight: acceptHighlight }, children);
};
//# sourceMappingURL=heatmap-highlight-modal.js.map