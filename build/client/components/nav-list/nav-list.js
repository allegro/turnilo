"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("../../utils/dom/dom");
var svg_icon_1 = require("../svg-icon/svg-icon");
require("./nav-list.scss");
function isNavLink(item) {
    return "href" in item;
}
function renderIcon(iconSvg) {
    return iconSvg ? React.createElement("span", { className: "icon" },
        React.createElement(svg_icon_1.SvgIcon, { svg: iconSvg })) : null;
}
function renderLink(_a, icon, selected) {
    var name = _a.name, title = _a.title, href = _a.href, newTab = _a.newTab, tooltip = _a.tooltip;
    var target = newTab ? "_blank" : null;
    var className = dom_1.classNames("item", { selected: selected });
    return React.createElement("a", { className: className, href: href, title: tooltip, target: target, key: name },
        renderIcon(icon),
        title);
}
function renderAction(_a, icon, selected) {
    var name = _a.name, title = _a.title, onClick = _a.onClick, tooltip = _a.tooltip;
    var className = dom_1.classNames("item", { selected: selected });
    return React.createElement("div", { className: className, title: tooltip, key: name, onClick: onClick },
        renderIcon(icon),
        title);
}
function renderItem(item, iconSvg, selectedName) {
    var selected = selectedName && selectedName === item.name;
    return isNavLink(item) ? renderLink(item, iconSvg, selected) : renderAction(item, iconSvg, selected);
}
exports.NavList = function (_a) {
    var title = _a.title, navLinks = _a.navLinks, iconSvg = _a.iconSvg, selected = _a.selected;
    return React.createElement("div", { className: dom_1.classNames("nav-list", { "no-title": !title }) },
        title && React.createElement("div", { className: "group-title" }, title),
        React.createElement("div", { className: "items" }, navLinks.map(function (navLink) { return renderItem(navLink, iconSvg, selected); })));
};
//# sourceMappingURL=nav-list.js.map