"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("../../utils/dom/dom");
var split_menu_1 = require("../split-menu/split-menu");
var svg_icon_1 = require("../svg-icon/svg-icon");
var with_ref_1 = require("../with-ref/with-ref");
var SPLIT_CLASS_NAME = "split";
exports.SplitTile = function (props) {
    var essence = props.essence, open = props.open, split = props.split, dimension = props.dimension, style = props.style, removeSplit = props.removeSplit, updateSplit = props.updateSplit, openMenu = props.openMenu, closeMenu = props.closeMenu, dragStart = props.dragStart, containerStage = props.containerStage;
    var title = split.getTitle(dimension);
    var remove = function (e) {
        e.stopPropagation();
        removeSplit(split);
    };
    return React.createElement(with_ref_1.WithRef, null, function (_a) {
        var openOn = _a.ref, setRef = _a.setRef;
        return React.createElement(React.Fragment, null,
            React.createElement("div", { className: dom_1.classNames(SPLIT_CLASS_NAME, "dimension"), key: split.toKey(), ref: setRef, draggable: true, onClick: function () { return openMenu(split); }, onDragStart: function (e) { return dragStart(dimension.title, split, e); }, style: style },
                React.createElement("div", { className: "reading" }, title),
                React.createElement("div", { className: "remove", onClick: remove },
                    React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/x.svg") }))),
            open && openOn && React.createElement(split_menu_1.SplitMenu, { saveSplit: updateSplit, essence: essence, openOn: openOn, containerStage: containerStage, onClose: closeMenu, dimension: dimension, split: split }));
    });
};
//# sourceMappingURL=split-tile.js.map