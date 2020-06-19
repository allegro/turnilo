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
var immutable_class_1 = require("immutable-class");
var React = require("react");
var auto_refresh_menu_1 = require("../../../components/auto-refresh-menu/auto-refresh-menu");
var debug_menu_1 = require("../../../components/debug-menu/debug-menu");
var info_bubble_1 = require("../../../components/info-bubble/info-bubble");
var share_menu_1 = require("../../../components/share-menu/share-menu");
var svg_icon_1 = require("../../../components/svg-icon/svg-icon");
var timezone_menu_1 = require("../../../components/timezone-menu/timezone-menu");
require("./cube-header-bar.scss");
var CubeHeaderBar = (function (_super) {
    __extends(CubeHeaderBar, _super);
    function CubeHeaderBar() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            shareMenuAnchor: null,
            autoRefreshMenuAnchor: null,
            autoRefreshRate: null,
            timezoneMenuAnchor: null,
            debugMenuAnchor: null,
            animating: false
        };
        _this.setAutoRefreshRate = function (rate) {
            var autoRefreshRate = _this.state.autoRefreshRate;
            if (immutable_class_1.immutableEqual(autoRefreshRate, rate))
                return;
            _this.clearTimerIfExists();
            var refreshMaxTime = _this.props.refreshMaxTime;
            if (refreshMaxTime && rate) {
                _this.autoRefreshTimer = window.setInterval(function () {
                    refreshMaxTime();
                }, rate.getCanonicalLength());
            }
            _this.setState({
                autoRefreshRate: rate
            });
        };
        _this.toggleShareMenu = function (e) {
            var shareMenuAnchor = _this.state.shareMenuAnchor;
            shareMenuAnchor ? _this.closeShareMenu() : _this.openShareMenu(e.currentTarget);
        };
        _this.openShareMenu = function (anchor) { return _this.setState({ shareMenuAnchor: anchor }); };
        _this.closeShareMenu = function () { return _this.setState({ shareMenuAnchor: null }); };
        _this.toggleAutoRefreshMenu = function (e) {
            var autoRefreshMenuAnchor = _this.state.autoRefreshMenuAnchor;
            autoRefreshMenuAnchor ? _this.closeAutoRefreshMenu() : _this.openAutoRefreshMenu(e.currentTarget);
        };
        _this.openAutoRefreshMenu = function (anchor) { return _this.setState({ autoRefreshMenuAnchor: anchor }); };
        _this.closeAutoRefreshMenu = function () { return _this.setState({ autoRefreshMenuAnchor: null }); };
        _this.toggleTimezoneMenu = function (e) {
            var timezoneMenuAnchor = _this.state.timezoneMenuAnchor;
            timezoneMenuAnchor ? _this.closeTimezoneMenu() : _this.openTimezoneMenu(e.currentTarget);
        };
        _this.openTimezoneMenu = function (anchor) { return _this.setState({ timezoneMenuAnchor: anchor }); };
        _this.closeTimezoneMenu = function () { return _this.setState({ timezoneMenuAnchor: null }); };
        _this.toggleDebugMenu = function (e) {
            var debugMenuAnchor = _this.state.debugMenuAnchor;
            debugMenuAnchor ? _this.closeDebugMenu() : _this.openDebugMenu(e.currentTarget);
        };
        _this.openDebugMenu = function (anchor) { return _this.setState({ debugMenuAnchor: anchor }); };
        _this.closeDebugMenu = function () { return _this.setState({ debugMenuAnchor: null }); };
        return _this;
    }
    CubeHeaderBar.prototype.componentDidMount = function () {
        this.mounted = true;
    };
    CubeHeaderBar.prototype.componentWillReceiveProps = function (nextProps) {
        var _this = this;
        if (!this.props.updatingMaxTime && nextProps.updatingMaxTime) {
            this.setState({ animating: true });
            setTimeout(function () {
                if (!_this.mounted)
                    return;
                _this.setState({ animating: false });
            }, 1000);
        }
    };
    CubeHeaderBar.prototype.componentWillUnmount = function () {
        this.mounted = false;
        this.clearTimerIfExists();
    };
    CubeHeaderBar.prototype.clearTimerIfExists = function () {
        if (this.autoRefreshTimer) {
            clearInterval(this.autoRefreshTimer);
            this.autoRefreshTimer = null;
        }
    };
    CubeHeaderBar.prototype.renderShareMenu = function () {
        var _a = this.props, customization = _a.customization, essence = _a.essence, timekeeper = _a.timekeeper, openUrlShortenerModal = _a.openUrlShortenerModal, urlForEssence = _a.urlForEssence, getDownloadableDataset = _a.getDownloadableDataset;
        var shareMenuAnchor = this.state.shareMenuAnchor;
        if (!shareMenuAnchor)
            return null;
        return React.createElement(share_menu_1.ShareMenu, { essence: essence, openUrlShortenerModal: openUrlShortenerModal, timekeeper: timekeeper, openOn: shareMenuAnchor, onClose: this.closeShareMenu, customization: customization, urlForEssence: urlForEssence, getDownloadableDataset: getDownloadableDataset });
    };
    CubeHeaderBar.prototype.renderAutoRefreshMenu = function () {
        var _a = this.props, refreshMaxTime = _a.refreshMaxTime, _b = _a.essence, dataCube = _b.dataCube, timezone = _b.timezone, timekeeper = _a.timekeeper;
        var _c = this.state, autoRefreshMenuAnchor = _c.autoRefreshMenuAnchor, autoRefreshRate = _c.autoRefreshRate;
        if (!autoRefreshMenuAnchor)
            return null;
        return React.createElement(auto_refresh_menu_1.AutoRefreshMenu, { timekeeper: timekeeper, openOn: autoRefreshMenuAnchor, onClose: this.closeAutoRefreshMenu, autoRefreshRate: autoRefreshRate, setAutoRefreshRate: this.setAutoRefreshRate, refreshMaxTime: refreshMaxTime, dataCube: dataCube, timezone: timezone });
    };
    CubeHeaderBar.prototype.renderTimezoneMenu = function () {
        var _a = this.props, changeTimezone = _a.changeTimezone, timezone = _a.essence.timezone, customization = _a.customization;
        var timezoneMenuAnchor = this.state.timezoneMenuAnchor;
        if (!timezoneMenuAnchor)
            return null;
        return React.createElement(timezone_menu_1.TimezoneMenu, { timezone: timezone, timezones: customization.getTimezones(), changeTimezone: changeTimezone, openOn: timezoneMenuAnchor, onClose: this.closeTimezoneMenu });
    };
    CubeHeaderBar.prototype.renderDebugMenu = function () {
        var debugMenuAnchor = this.state.debugMenuAnchor;
        if (!debugMenuAnchor)
            return null;
        var _a = this.props, dataCube = _a.essence.dataCube, openRawDataModal = _a.openRawDataModal, openViewDefinitionModal = _a.openViewDefinitionModal, openDruidQueryModal = _a.openDruidQueryModal;
        return React.createElement(debug_menu_1.DebugMenu, { dataCube: dataCube, openRawDataModal: openRawDataModal, openDruidQueryModal: openDruidQueryModal, openViewDefinitionModal: openViewDefinitionModal, openOn: debugMenuAnchor, onClose: this.closeDebugMenu });
    };
    CubeHeaderBar.prototype.render = function () {
        var customization = this.props.customization;
        var headerStyle = null;
        if (customization && customization.headerBackground) {
            headerStyle = {
                background: customization.headerBackground
            };
        }
        return React.createElement("header", { className: "cube-header-bar", style: headerStyle },
            this.renderLeftBar(),
            this.renderRightBar(),
            this.renderShareMenu(),
            this.renderAutoRefreshMenu(),
            this.renderTimezoneMenu(),
            this.renderDebugMenu());
    };
    CubeHeaderBar.prototype.renderRightBar = function () {
        return React.createElement("div", { className: "right-bar" },
            React.createElement("div", { className: "text-button", onClick: this.toggleTimezoneMenu }, this.props.essence.timezone.toString()),
            React.createElement("div", { className: "icon-button", onClick: this.toggleShareMenu },
                React.createElement(svg_icon_1.SvgIcon, { svg: require("../../../icons/full-hiluk.svg") })),
            React.createElement("div", { className: "icon-button", onClick: this.toggleDebugMenu },
                React.createElement(svg_icon_1.SvgIcon, { svg: require("../../../icons/full-settings.svg") })));
    };
    CubeHeaderBar.prototype.renderLeftBar = function () {
        var _a = this.props, onNavClick = _a.onNavClick, dataCube = _a.essence.dataCube;
        return React.createElement("div", { className: "left-bar" },
            React.createElement("div", { className: "menu-icon", onClick: onNavClick },
                React.createElement(svg_icon_1.SvgIcon, { svg: require("../../../icons/menu.svg") })),
            React.createElement("div", { className: "title", onClick: onNavClick }, dataCube.title),
            dataCube.description && React.createElement(info_bubble_1.InfoBubble, { className: "cube-description", description: dataCube.description }));
    };
    return CubeHeaderBar;
}(React.Component));
exports.CubeHeaderBar = CubeHeaderBar;
//# sourceMappingURL=cube-header-bar.js.map