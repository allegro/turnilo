"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var searchIcon = require("../../icons/full-search.svg");
var removeIcon = require("../../icons/full-remove.svg");
function pinboardIcons(props) {
    var showSearch = props.showSearch, onClose = props.onClose, onSearchClick = props.onSearchClick;
    return [{
            name: "search",
            ref: "search",
            onClick: onSearchClick,
            svg: searchIcon,
            active: showSearch
        }, {
            name: "close",
            ref: "close",
            onClick: onClose,
            svg: removeIcon
        }];
}
exports.pinboardIcons = pinboardIcons;
//# sourceMappingURL=pinboard-icons.js.map