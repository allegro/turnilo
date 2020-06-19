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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ReactDOM = require("react-dom");
var constants_1 = require("../../config/constants");
var data_cubes_filter_1 = require("../../utils/data-cubes-filter/data-cubes-filter");
var dom_1 = require("../../utils/dom/dom");
var clearable_input_1 = require("../clearable-input/clearable-input");
var nav_list_1 = require("../nav-list/nav-list");
var nav_logo_1 = require("../nav-logo/nav-logo");
var svg_icon_1 = require("../svg-icon/svg-icon");
require("./side-drawer.scss");
function openHome() {
    window.location.hash = "#";
}
var SideDrawer = (function (_super) {
    __extends(SideDrawer, _super);
    function SideDrawer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { query: "" };
        _this.queryChange = function (query) {
            _this.setState(function (state) { return (__assign({}, state, { query: query })); });
        };
        _this.globalMouseDownListener = function (e) {
            var myElement = ReactDOM.findDOMNode(_this);
            var target = e.target;
            if (dom_1.isInside(target, myElement))
                return;
            _this.props.onClose();
        };
        _this.globalKeyDownListener = function (e) {
            if (!dom_1.escapeKey(e))
                return;
            _this.props.onClose();
        };
        _this.navigateToCube = function (dataCube) {
            var _a = _this.props, onClose = _a.onClose, essence = _a.essence, changeDataCubeAndEssence = _a.changeDataCubeAndEssence;
            changeDataCubeAndEssence(dataCube, essence.updateDataCube(dataCube));
            onClose();
        };
        return _this;
    }
    SideDrawer.prototype.componentDidMount = function () {
        window.addEventListener("mousedown", this.globalMouseDownListener);
        window.addEventListener("keydown", this.globalKeyDownListener);
    };
    SideDrawer.prototype.componentWillUnmount = function () {
        window.removeEventListener("mousedown", this.globalMouseDownListener);
        window.removeEventListener("keydown", this.globalKeyDownListener);
    };
    SideDrawer.prototype.renderNavLogo = function () {
        var customization = this.props.customization;
        if (!customization.customLogoSvg)
            return null;
        return React.createElement(nav_logo_1.NavLogo, { customLogoSvg: customization.customLogoSvg });
    };
    SideDrawer.prototype.renderHomeLink = function () {
        return React.createElement("div", { className: "home-container" },
            React.createElement("div", { className: dom_1.classNames("home-link"), onClick: openHome },
                React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/home.svg") }),
                React.createElement("span", null, "Home")));
    };
    SideDrawer.prototype.renderDataCubeList = function () {
        var _this = this;
        var _a = this.props, dataCubes = _a.dataCubes, dataCube = _a.essence.dataCube;
        var query = this.state.query;
        var cubes = data_cubes_filter_1.default(dataCubes, query, false);
        if (cubes.length === 0) {
            var message = query ? "" + constants_1.STRINGS.noDataCubesFound + query : constants_1.STRINGS.noDataCubes;
            return React.createElement("div", { className: "data-cubes__message" }, message);
        }
        var navLinks = cubes.map(function (dataCube) {
            var name = dataCube.name, title = dataCube.title;
            return {
                name: name,
                title: title,
                onClick: function () { return _this.navigateToCube(dataCube); }
            };
        });
        return React.createElement(nav_list_1.NavList, { selected: dataCube.name, navLinks: navLinks, iconSvg: require("../../icons/full-cube.svg") });
    };
    SideDrawer.prototype.renderDataCubes = function () {
        var query = this.state.query;
        return React.createElement("div", { className: "data-cubes__list" },
            React.createElement("div", { className: "search-input" },
                React.createElement(clearable_input_1.ClearableInput, { value: query, onChange: this.queryChange, placeholder: "Search data cubes..." })),
            this.renderDataCubeList());
    };
    SideDrawer.prototype.infoLink = function () {
        var _a = this.props, onClose = _a.onClose, onOpenAbout = _a.onOpenAbout;
        return {
            name: "info",
            title: constants_1.STRINGS.infoAndFeedback,
            tooltip: "Learn more about Turnilo",
            onClick: function () {
                onClose();
                onOpenAbout();
            }
        };
    };
    SideDrawer.prototype.render = function () {
        return React.createElement("div", { className: "side-drawer" },
            this.renderNavLogo(),
            this.renderDataCubes());
    };
    return SideDrawer;
}(React.Component));
exports.SideDrawer = SideDrawer;
//# sourceMappingURL=side-drawer.js.map