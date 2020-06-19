"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var essence_1 = require("../../../common/models/essence/essence");
var split_1 = require("../../../common/models/split/split");
var stage_1 = require("../../../common/models/stage/stage");
var constants_1 = require("../../config/constants");
var dom_1 = require("../../utils/dom/dom");
var bubble_menu_1 = require("../bubble-menu/bubble-menu");
var svg_icon_1 = require("../svg-icon/svg-icon");
require("./dimension-actions-menu.scss");
var ACTION_SIZE = 58;
exports.DimensionActionsMenu = function (props) {
    var triggerFilterMenu = props.triggerFilterMenu, clicker = props.clicker, essence = props.essence, direction = props.direction, containerStage = props.containerStage, openOn = props.openOn, dimension = props.dimension, onClose = props.onClose;
    return React.createElement(bubble_menu_1.BubbleMenu, { className: "dimension-actions-menu", direction: direction, containerStage: containerStage, stage: stage_1.Stage.fromSize(ACTION_SIZE * 2, ACTION_SIZE * 2), fixedSize: true, openOn: openOn, onClose: onClose },
        React.createElement(exports.DimensionActions, { essence: essence, clicker: clicker, dimension: dimension, onClose: onClose, triggerFilterMenu: triggerFilterMenu }));
};
exports.DimensionActions = function (props) {
    var onClose = props.onClose, triggerFilterMenu = props.triggerFilterMenu, clicker = props.clicker, splits = props.essence.splits, dimension = props.dimension;
    if (!dimension)
        return null;
    var hasSplitOn = splits.hasSplitOn(dimension);
    var isOnlySplit = splits.length() === 1 && hasSplitOn;
    var isPinable = dimension.kind === "string" || dimension.kind === "boolean";
    function onFilter() {
        triggerFilterMenu(dimension);
        onClose();
    }
    function onSplit() {
        if (!isOnlySplit)
            clicker.changeSplit(split_1.Split.fromDimension(dimension), essence_1.VisStrategy.FairGame);
        onClose();
    }
    function onSubSplit() {
        if (!hasSplitOn)
            clicker.addSplit(split_1.Split.fromDimension(dimension), essence_1.VisStrategy.FairGame);
        onClose();
    }
    function onPin() {
        if (isPinable)
            clicker.pin(dimension);
        onClose();
    }
    return React.createElement(React.Fragment, null,
        React.createElement("div", { className: dom_1.classNames("filter", "action"), onClick: onFilter },
            React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/preview-filter.svg") }),
            React.createElement("div", { className: "action-label" }, constants_1.STRINGS.filter)),
        React.createElement("div", { className: dom_1.classNames("pin", "action", { disabled: !isPinable }), onClick: onPin },
            React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/preview-pin.svg") }),
            React.createElement("div", { className: "action-label" }, constants_1.STRINGS.pin)),
        React.createElement("div", { className: dom_1.classNames("split", "action", { disabled: isOnlySplit }), onClick: onSplit },
            React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/preview-split.svg") }),
            React.createElement("div", { className: "action-label" }, constants_1.STRINGS.split)),
        React.createElement("div", { className: dom_1.classNames("subsplit", "action", { disabled: hasSplitOn }), onClick: onSubSplit },
            React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/preview-subsplit.svg") }),
            React.createElement("div", { className: "action-label" }, constants_1.STRINGS.subsplit)));
};
//# sourceMappingURL=dimension-actions-menu.js.map