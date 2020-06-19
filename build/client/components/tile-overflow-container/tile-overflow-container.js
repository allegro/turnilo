"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var stage_1 = require("../../../common/models/stage/stage");
var constants_1 = require("../../config/constants");
var dom_1 = require("../../utils/dom/dom");
var bubble_menu_1 = require("../bubble-menu/bubble-menu");
var with_ref_1 = require("../with-ref/with-ref");
var SEGMENT_HEIGHT = 29 + constants_1.CORE_ITEM_GAP;
var TileOverflowContainerMenu = function (props) {
    var items = props.items, openOn = props.openOn, closeOverflowMenu = props.closeOverflowMenu;
    var positionedItems = items.map(function (item, idx) {
        return React.cloneElement(item, { style: dom_1.transformStyle(0, constants_1.CORE_ITEM_GAP + idx * SEGMENT_HEIGHT) });
    });
    return React.createElement(bubble_menu_1.BubbleMenu, { className: "overflow-menu", direction: "down", stage: stage_1.Stage.fromSize(208, constants_1.CORE_ITEM_GAP + (items.length * SEGMENT_HEIGHT)), fixedSize: true, openOn: openOn, onClose: closeOverflowMenu }, positionedItems);
};
exports.TileOverflowContainer = function (props) {
    var x = props.x, items = props.items, open = props.open, openOverflowMenu = props.openOverflowMenu, className = props.className, closeOverflowMenu = props.closeOverflowMenu;
    var style = dom_1.transformStyle(x, 0);
    return React.createElement(with_ref_1.WithRef, null, function (_a) {
        var openOn = _a.ref, setRef = _a.setRef;
        return React.createElement(React.Fragment, null,
            React.createElement("div", { className: dom_1.classNames("overflow", className), style: style, ref: setRef, onClick: openOverflowMenu },
                React.createElement("div", { className: "count" }, "+" + items.length)),
            open && openOn && React.createElement(TileOverflowContainerMenu, { openOn: openOn, items: items, closeOverflowMenu: closeOverflowMenu }));
    });
};
//# sourceMappingURL=tile-overflow-container.js.map