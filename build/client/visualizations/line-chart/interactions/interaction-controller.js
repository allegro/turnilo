"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_1 = require("immutable");
var React = require("react");
var global_event_listener_1 = require("../../../components/global-event-listener/global-event-listener");
var mouse_event_offset_1 = require("../../../utils/mouse-event-offset/mouse-event-offset");
var splits_1 = require("../utils/splits");
var continuous_range_1 = require("./continuous-range");
var find_closest_datum_1 = require("./find-closest-datum");
var highlight_clause_1 = require("./highlight-clause");
var interaction_1 = require("./interaction");
var snap_range_to_grid_1 = require("./snap-range-to-grid");
var InteractionController = (function (_super) {
    __extends(InteractionController, _super);
    function InteractionController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { interaction: null, scrollTop: 0 };
        _this.handleHover = function (chartId, offset) {
            var interaction = _this.state.interaction;
            if (interaction_1.isDragging(interaction) || interaction_1.isHighlight(interaction))
                return;
            var hoverRange = _this.findRangeUnderOffset(offset);
            if (hoverRange === null) {
                _this.setState({ interaction: null });
                return;
            }
            if (interaction_1.isHover(interaction) && interaction.range.equals(hoverRange))
                return;
            _this.setState({ interaction: interaction_1.createHover(chartId, hoverRange) });
        };
        _this.onMouseLeave = function () {
            var interaction = _this.state.interaction;
            if (!interaction_1.isHover(interaction))
                return;
            _this.setState({ interaction: null });
        };
        _this.handleDragStart = function (chartId, offset) {
            var timezone = _this.props.essence.timezone;
            var start = _this.findValueUnderOffset(offset);
            var end = continuous_range_1.shiftByOne(start, timezone);
            _this.setState({ interaction: interaction_1.createDragging(chartId, start, end) });
        };
        _this.dragging = function (e) {
            var interaction = _this.state.interaction;
            if (!interaction_1.isDragging(interaction))
                return;
            var offset = _this.calculateOffset(e);
            if (offset === null)
                return;
            var end = _this.findValueUnderOffset(offset);
            var start = interaction.start, key = interaction.key;
            _this.setState({ interaction: interaction_1.createDragging(key, start, end) });
        };
        _this.stopDragging = function (e) {
            var interaction = _this.state.interaction;
            if (!interaction_1.isDragging(interaction))
                return;
            var offset = _this.calculateOffset(e);
            if (offset === null)
                return;
            _this.setState({ interaction: null });
            var _a = _this.props, essence = _a.essence, saveHighlight = _a.saveHighlight;
            var start = interaction.start, key = interaction.key;
            var end = _this.findValueUnderOffset(offset);
            var range = snap_range_to_grid_1.snapRangeToGrid(continuous_range_1.constructRange(start, end, essence.timezone), essence);
            saveHighlight(immutable_1.List.of(highlight_clause_1.toFilterClause(range, splits_1.getContinuousReference(essence))), key);
        };
        _this.scrollCharts = function (scrollEvent) {
            var scrollTop = scrollEvent.target.scrollTop;
            _this.setState({
                interaction: null,
                scrollTop: scrollTop
            });
        };
        return _this;
    }
    InteractionController.prototype.calculateOffset = function (e) {
        var chartsContainerRef = this.props.chartsContainerRef;
        if (!chartsContainerRef.current)
            return null;
        var x = mouse_event_offset_1.mouseEventOffset(e)[0];
        var left = chartsContainerRef.current.getBoundingClientRect().left;
        return x - left;
    };
    InteractionController.prototype.findValueUnderOffset = function (offset) {
        var xScale = this.props.xScale;
        return xScale.invert(offset);
    };
    InteractionController.prototype.findRangeUnderOffset = function (offset) {
        var value = this.findValueUnderOffset(offset);
        var _a = this.props, essence = _a.essence, xScale = _a.xScale, dataset = _a.dataset;
        var closestDatum = find_closest_datum_1.findClosestDatum(value, essence, dataset, xScale);
        var range = closestDatum && closestDatum[splits_1.getContinuousReference(essence)];
        return range;
    };
    InteractionController.prototype.interaction = function () {
        var highlight = this.props.highlight;
        if (highlight)
            return interaction_1.createHighlight(highlight);
        return this.state.interaction;
    };
    InteractionController.prototype.render = function () {
        var interaction = this.interaction();
        var _a = this.props, children = _a.children, acceptHighlight = _a.acceptHighlight, dropHighlight = _a.dropHighlight;
        var hocProps = {
            interaction: interaction,
            acceptHighlight: acceptHighlight,
            dropHighlight: dropHighlight,
            dragStart: this.handleDragStart,
            handleHover: this.handleHover,
            mouseLeave: this.onMouseLeave
        };
        return React.createElement(React.Fragment, null,
            React.createElement(global_event_listener_1.GlobalEventListener, { mouseUp: this.stopDragging, mouseMove: this.dragging, scroll: this.scrollCharts }),
            children(hocProps));
    };
    return InteractionController;
}(React.Component));
exports.InteractionController = InteractionController;
//# sourceMappingURL=interaction-controller.js.map