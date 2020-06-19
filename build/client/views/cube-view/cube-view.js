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
var memoize_one_1 = require("memoize-one");
var React = require("react");
var react_transition_group_1 = require("react-transition-group");
var data_cube_1 = require("../../../common/models/data-cube/data-cube");
var device_1 = require("../../../common/models/device/device");
var essence_1 = require("../../../common/models/essence/essence");
var split_1 = require("../../../common/models/split/split");
var stage_1 = require("../../../common/models/stage/stage");
var timekeeper_1 = require("../../../common/models/timekeeper/timekeeper");
var time_1 = require("../../../common/utils/time/time");
var dimension_measure_panel_1 = require("../../components/dimension-measure-panel/dimension-measure-panel");
var drop_indicator_1 = require("../../components/drop-indicator/drop-indicator");
var filter_tile_1 = require("../../components/filter-tile/filter-tile");
var global_event_listener_1 = require("../../components/global-event-listener/global-event-listener");
var manual_fallback_1 = require("../../components/manual-fallback/manual-fallback");
var pinboard_panel_1 = require("../../components/pinboard-panel/pinboard-panel");
var resize_handle_1 = require("../../components/resize-handle/resize-handle");
var series_tiles_row_1 = require("../../components/series-tile/series-tiles-row");
var side_drawer_1 = require("../../components/side-drawer/side-drawer");
var split_tiles_row_1 = require("../../components/split-tile/split-tiles-row");
var svg_icon_1 = require("../../components/svg-icon/svg-icon");
var vis_selector_1 = require("../../components/vis-selector/vis-selector");
var druid_query_modal_1 = require("../../modals/druid-query-modal/druid-query-modal");
var raw_data_modal_1 = require("../../modals/raw-data-modal/raw-data-modal");
var url_shortener_modal_1 = require("../../modals/url-shortener-modal/url-shortener-modal");
var view_definition_modal_1 = require("../../modals/view-definition-modal/view-definition-modal");
var drag_manager_1 = require("../../utils/drag-manager/drag-manager");
var localStorage = require("../../utils/local-storage/local-storage");
var tabular_options_1 = require("../../utils/tabular-options/tabular-options");
var visualizations_1 = require("../../visualizations");
var cube_context_1 = require("./cube-context");
var cube_header_bar_1 = require("./cube-header-bar/cube-header-bar");
require("./cube-view.scss");
var ToggleArrow = function (_a) {
    var right = _a.right;
    return right
        ? React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/full-caret-small-right.svg") })
        : React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/full-caret-small-left.svg") });
};
var defaultLayout = {
    factPanel: { width: 240 },
    pinboard: { width: 240 }
};
var MIN_PANEL_WIDTH = 240;
var MAX_PANEL_WIDTH = 400;
var CubeView = (function (_super) {
    __extends(CubeView, _super);
    function CubeView(props) {
        var _this = _super.call(this, props) || this;
        _this.visualization = React.createRef();
        _this.container = React.createRef();
        _this.filterTile = React.createRef();
        _this.seriesTile = React.createRef();
        _this.splitTile = React.createRef();
        _this.refreshMaxTime = function () {
            var _a = _this.state, essence = _a.essence, timekeeper = _a.timekeeper;
            var dataCube = essence.dataCube;
            _this.setState({ updatingMaxTime: true });
            data_cube_1.DataCube.queryMaxTime(dataCube)
                .then(function (maxTime) {
                if (!_this.mounted)
                    return;
                var timeName = dataCube.name;
                var isBatchCube = !dataCube.refreshRule.isRealtime();
                var isCubeUpToDate = time_1.datesEqual(maxTime, timekeeper.getTime(timeName));
                if (isBatchCube && isCubeUpToDate) {
                    _this.setState({ updatingMaxTime: false });
                    return;
                }
                _this.setState({
                    timekeeper: timekeeper.updateTime(timeName, maxTime),
                    updatingMaxTime: false,
                    lastRefreshRequestTimestamp: (new Date()).getTime()
                });
            });
        };
        _this.globalResizeListener = function () {
            var containerDOM = _this.container.current;
            var visualizationDOM = _this.visualization.current;
            if (!containerDOM || !visualizationDOM)
                return;
            _this.setState({
                deviceSize: device_1.Device.getSize(),
                menuStage: stage_1.Stage.fromClientRect(containerDOM.getBoundingClientRect()),
                visualizationStage: stage_1.Stage.fromClientRect(visualizationDOM.getBoundingClientRect())
            });
        };
        _this.dragEnter = function (e) {
            if (!CubeView.canDrop())
                return;
            e.preventDefault();
            _this.setState({ dragOver: true });
        };
        _this.dragOver = function (e) {
            if (!CubeView.canDrop())
                return;
            e.preventDefault();
        };
        _this.dragLeave = function () {
            _this.setState({ dragOver: false });
        };
        _this.drop = function (e) {
            if (!CubeView.canDrop())
                return;
            e.preventDefault();
            var dimension = drag_manager_1.DragManager.draggingDimension();
            if (dimension) {
                _this.clicker.changeSplit(split_1.Split.fromDimension(dimension), essence_1.VisStrategy.FairGame);
            }
            _this.setState({ dragOver: false });
        };
        _this.openRawDataModal = function () {
            _this.setState({
                showRawDataModal: true
            });
        };
        _this.onRawDataModalClose = function () {
            _this.setState({
                showRawDataModal: false
            });
        };
        _this.openViewDefinitionModal = function () {
            _this.setState({
                showViewDefinitionModal: true
            });
        };
        _this.onViewDefinitionModalClose = function () {
            _this.setState({
                showViewDefinitionModal: false
            });
        };
        _this.openDruidQueryModal = function () {
            _this.setState({
                showDruidQueryModal: true
            });
        };
        _this.closeDruidQueryModal = function () {
            _this.setState({
                showDruidQueryModal: false
            });
        };
        _this.openUrlShortenerModal = function (url, title) {
            _this.setState({
                urlShortenerModalProps: { url: url, title: title }
            });
        };
        _this.closeUrlShortenerModal = function () {
            _this.setState({
                urlShortenerModalProps: null
            });
        };
        _this.triggerFilterMenu = function (dimension) {
            if (!dimension)
                return;
            _this.filterTile.current.filterMenuRequest(dimension);
        };
        _this.appendDirtySeries = function (series) {
            if (!series)
                return;
            _this.seriesTile.current.appendDirtySeries(series);
        };
        _this.changeTimezone = function (newTimezone) {
            var essence = _this.state.essence;
            var newEssence = essence.changeTimezone(newTimezone);
            _this.setState({ essence: newEssence });
        };
        _this.toggleFactPanel = function () {
            var _a = _this.state, factPanel = _a.layout.factPanel, layout = _a.layout;
            _this.updateLayout(__assign({}, layout, { factPanel: __assign({}, factPanel, { hidden: !factPanel.hidden }) }));
        };
        _this.togglePinboard = function () {
            var _a = _this.state, pinboard = _a.layout.pinboard, layout = _a.layout;
            _this.updateLayout(__assign({}, layout, { pinboard: __assign({}, pinboard, { hidden: !pinboard.hidden }) }));
        };
        _this.onFactPanelResize = function (width) {
            var _a = _this.state, factPanel = _a.layout.factPanel, layout = _a.layout;
            _this.updateLayout(__assign({}, layout, { factPanel: __assign({}, factPanel, { width: width }) }));
        };
        _this.onPinboardPanelResize = function (width) {
            var _a = _this.state, pinboard = _a.layout.pinboard, layout = _a.layout;
            _this.updateLayout(__assign({}, layout, { pinboard: __assign({}, pinboard, { width: width }) }));
        };
        _this.onPanelResizeEnd = function () {
            _this.globalResizeListener();
        };
        _this.constructContext = memoize_one_1.default(function (essence, clicker) {
            return ({ essence: essence, clicker: clicker });
        }, function (_a, _b) {
            var nextEssence = _a[0], nextClicker = _a[1];
            var prevEssence = _b[0], prevClicker = _b[1];
            return nextEssence.equals(prevEssence) && nextClicker === prevClicker;
        });
        _this.sideDrawerOpen = function () {
            _this.setState({ showSideBar: true });
        };
        _this.sideDrawerClose = function () {
            _this.setState({ showSideBar: false });
        };
        _this.state = {
            essence: null,
            dragOver: false,
            layout: _this.getStoredLayout(),
            lastRefreshRequestTimestamp: 0,
            updatingMaxTime: false
        };
        _this.clicker = {
            changeFilter: function (filter) {
                _this.setState(function (state) {
                    var essence = state.essence;
                    essence = essence.changeFilter(filter);
                    return __assign({}, state, { essence: essence });
                });
            },
            changeComparisonShift: function (timeShift) {
                _this.setState(function (state) {
                    return (__assign({}, state, { essence: state.essence.changeComparisonShift(timeShift) }));
                });
            },
            changeSplits: function (splits, strategy) {
                var essence = _this.state.essence;
                _this.setState({ essence: essence.changeSplits(splits, strategy) });
            },
            changeSplit: function (split, strategy) {
                var essence = _this.state.essence;
                _this.setState({ essence: essence.changeSplit(split, strategy) });
            },
            addSplit: function (split, strategy) {
                var essence = _this.state.essence;
                _this.setState({ essence: essence.addSplit(split, strategy) });
            },
            removeSplit: function (split, strategy) {
                var essence = _this.state.essence;
                _this.setState({ essence: essence.removeSplit(split, strategy) });
            },
            changeSeriesList: function (seriesList) {
                var essence = _this.state.essence;
                _this.setState({ essence: essence.changeSeriesList(seriesList) });
            },
            addSeries: function (series) {
                var essence = _this.state.essence;
                _this.setState({ essence: essence.addSeries(series) });
            },
            removeSeries: function (series) {
                var essence = _this.state.essence;
                _this.setState({ essence: essence.removeSeries(series) });
            },
            changeVisualization: function (visualization, settings) {
                var essence = _this.state.essence;
                _this.setState({ essence: essence.changeVisualization(visualization, settings) });
            },
            pin: function (dimension) {
                var essence = _this.state.essence;
                _this.setState({ essence: essence.pin(dimension) });
            },
            unpin: function (dimension) {
                var essence = _this.state.essence;
                _this.setState({ essence: essence.unpin(dimension) });
            },
            changePinnedSortSeries: function (series) {
                var essence = _this.state.essence;
                _this.setState({ essence: essence.changePinnedSortSeries(series) });
            }
        };
        return _this;
    }
    CubeView.canDrop = function () {
        return drag_manager_1.DragManager.draggingDimension() !== null;
    };
    CubeView.prototype.componentWillMount = function () {
        var _a = this.props, hash = _a.hash, dataCube = _a.dataCube, initTimekeeper = _a.initTimekeeper;
        if (!dataCube) {
            throw new Error("Data cube is required.");
        }
        this.setState({
            timekeeper: initTimekeeper || timekeeper_1.Timekeeper.EMPTY
        });
        this.updateEssenceFromHashOrDataCube(hash, dataCube);
    };
    CubeView.prototype.componentDidMount = function () {
        this.mounted = true;
        drag_manager_1.DragManager.init();
        this.globalResizeListener();
    };
    CubeView.prototype.componentWillReceiveProps = function (nextProps) {
        var _a = this.props, hash = _a.hash, dataCube = _a.dataCube;
        if (!nextProps.dataCube) {
            throw new Error("Data cube is required.");
        }
        if (dataCube.name !== nextProps.dataCube.name || hash !== nextProps.hash) {
            this.updateEssenceFromHashOrDataCube(nextProps.hash, nextProps.dataCube);
        }
    };
    CubeView.prototype.componentWillUpdate = function (nextProps, nextState) {
        var changeEssence = this.props.changeEssence;
        var essence = this.state.essence;
        if (!nextState.essence.equals(essence)) {
            changeEssence(nextState.essence, false);
        }
    };
    CubeView.prototype.componentDidUpdate = function (prevProps, _a) {
        var _b = _a.layout, prevPinboard = _b.pinboard, prevFactPanel = _b.factPanel;
        var _c = this.state.layout, pinboard = _c.pinboard, factPanel = _c.factPanel;
        if (pinboard.hidden !== prevPinboard.hidden || factPanel.hidden !== prevFactPanel.hidden) {
            this.globalResizeListener();
        }
    };
    CubeView.prototype.componentWillUnmount = function () {
        this.mounted = false;
    };
    CubeView.prototype.updateEssenceFromHashOrDataCube = function (hash, dataCube) {
        var essence;
        try {
            essence = this.getEssenceFromHash(hash, dataCube);
        }
        catch (e) {
            var changeEssence = this.props.changeEssence;
            essence = this.getEssenceFromDataCube(dataCube);
            changeEssence(essence, true);
        }
        this.setState({ essence: essence });
    };
    CubeView.prototype.getEssenceFromDataCube = function (dataCube) {
        return essence_1.Essence.fromDataCube(dataCube);
    };
    CubeView.prototype.getEssenceFromHash = function (hash, dataCube) {
        if (!dataCube) {
            throw new Error("Data cube is required.");
        }
        if (!hash) {
            throw new Error("Hash is required.");
        }
        var getEssenceFromHash = this.props.getEssenceFromHash;
        return getEssenceFromHash(hash, dataCube);
    };
    CubeView.prototype.isSmallDevice = function () {
        return this.state.deviceSize === device_1.DeviceSize.SMALL;
    };
    CubeView.prototype.renderRawDataModal = function () {
        var _a = this.state, showRawDataModal = _a.showRawDataModal, essence = _a.essence, timekeeper = _a.timekeeper;
        if (!showRawDataModal)
            return null;
        return React.createElement(raw_data_modal_1.RawDataModal, { essence: essence, timekeeper: timekeeper, onClose: this.onRawDataModalClose });
    };
    CubeView.prototype.renderViewDefinitionModal = function () {
        var _a = this.state, showViewDefinitionModal = _a.showViewDefinitionModal, essence = _a.essence;
        if (!showViewDefinitionModal)
            return null;
        return React.createElement(view_definition_modal_1.ViewDefinitionModal, { onClose: this.onViewDefinitionModalClose, essence: essence });
    };
    CubeView.prototype.renderDruidQueryModal = function () {
        var _a = this.state, showDruidQueryModal = _a.showDruidQueryModal, essence = _a.essence, timekeeper = _a.timekeeper;
        if (!showDruidQueryModal)
            return null;
        return React.createElement(druid_query_modal_1.DruidQueryModal, { timekeeper: timekeeper, essence: essence, onClose: this.closeDruidQueryModal });
    };
    CubeView.prototype.renderUrlShortenerModal = function () {
        var urlShortenerModalProps = this.state.urlShortenerModalProps;
        if (!urlShortenerModalProps)
            return null;
        return React.createElement(url_shortener_modal_1.UrlShortenerModal, { title: urlShortenerModalProps.title, url: urlShortenerModalProps.url, onClose: this.closeUrlShortenerModal });
    };
    CubeView.prototype.getStoredLayout = function () {
        return localStorage.get("cube-view-layout-v2") || defaultLayout;
    };
    CubeView.prototype.storeLayout = function (layout) {
        localStorage.set("cube-view-layout-v2", layout);
    };
    CubeView.prototype.updateLayout = function (layout) {
        this.setState({ layout: layout });
        this.storeLayout(layout);
    };
    CubeView.prototype.getCubeContext = function () {
        var essence = this.state.essence;
        return this.constructContext(essence, this.clicker);
    };
    CubeView.prototype.render = function () {
        var _this = this;
        var clicker = this.clicker;
        var _a = this.props, urlForEssence = _a.urlForEssence, customization = _a.customization;
        var _b = this.state, layout = _b.layout, essence = _b.essence, timekeeper = _b.timekeeper, menuStage = _b.menuStage, visualizationStage = _b.visualizationStage, dragOver = _b.dragOver, updatingMaxTime = _b.updatingMaxTime;
        if (!essence)
            return null;
        var styles = this.calculateStyles();
        var headerBar = React.createElement(cube_header_bar_1.CubeHeaderBar, { clicker: clicker, essence: essence, timekeeper: timekeeper, onNavClick: this.sideDrawerOpen, urlForEssence: urlForEssence, refreshMaxTime: this.refreshMaxTime, openRawDataModal: this.openRawDataModal, openViewDefinitionModal: this.openViewDefinitionModal, openUrlShortenerModal: this.openUrlShortenerModal, openDruidQueryModal: this.openDruidQueryModal, customization: customization, getDownloadableDataset: function () { return _this.downloadableDataset; }, changeTimezone: this.changeTimezone, updatingMaxTime: updatingMaxTime });
        return React.createElement(cube_context_1.CubeContext.Provider, { value: this.getCubeContext() },
            React.createElement("div", { className: "cube-view" },
                React.createElement(global_event_listener_1.GlobalEventListener, { resize: this.globalResizeListener }),
                headerBar,
                React.createElement("div", { className: "container", ref: this.container },
                    !layout.factPanel.hidden && React.createElement(dimension_measure_panel_1.DimensionMeasurePanel, { style: styles.dimensionMeasurePanel, clicker: clicker, essence: essence, menuStage: menuStage, triggerFilterMenu: this.triggerFilterMenu, appendDirtySeries: this.appendDirtySeries }),
                    !this.isSmallDevice() && !layout.factPanel.hidden && React.createElement(resize_handle_1.ResizeHandle, { direction: resize_handle_1.Direction.LEFT, value: layout.factPanel.width, onResize: this.onFactPanelResize, onResizeEnd: this.onPanelResizeEnd, min: MIN_PANEL_WIDTH, max: MAX_PANEL_WIDTH },
                        React.createElement(resize_handle_1.DragHandle, null)),
                    React.createElement("div", { className: "center-panel", style: styles.centerPanel },
                        React.createElement("div", { className: "center-top-bar" },
                            React.createElement("div", { className: "dimension-panel-toggle", onClick: this.toggleFactPanel },
                                React.createElement(ToggleArrow, { right: layout.factPanel.hidden })),
                            React.createElement("div", { className: "filter-split-section" },
                                React.createElement(filter_tile_1.FilterTile, { ref: this.filterTile, clicker: clicker, essence: essence, timekeeper: timekeeper, menuStage: visualizationStage }),
                                React.createElement(split_tiles_row_1.SplitTilesRow, { ref: this.splitTile, clicker: clicker, essence: essence, menuStage: visualizationStage }),
                                React.createElement(series_tiles_row_1.SeriesTilesRow, { ref: this.seriesTile, menuStage: visualizationStage })),
                            React.createElement(vis_selector_1.VisSelector, { clicker: clicker, essence: essence }),
                            React.createElement("div", { className: "pinboard-toggle", onClick: this.togglePinboard },
                                React.createElement(ToggleArrow, { right: !layout.pinboard.hidden }))),
                        React.createElement("div", { className: "center-main", onDragEnter: this.dragEnter },
                            React.createElement("div", { className: "visualization", ref: this.visualization }, this.visElement()),
                            this.manualFallback(),
                            dragOver ? React.createElement(drop_indicator_1.DropIndicator, null) : null,
                            dragOver ? React.createElement("div", { className: "drag-mask", onDragOver: this.dragOver, onDragLeave: this.dragLeave, onDragExit: this.dragLeave, onDrop: this.drop }) : null)),
                    !this.isSmallDevice() && !layout.pinboard.hidden && React.createElement(resize_handle_1.ResizeHandle, { direction: resize_handle_1.Direction.RIGHT, value: layout.pinboard.width, onResize: this.onPinboardPanelResize, onResizeEnd: this.onPanelResizeEnd, min: MIN_PANEL_WIDTH, max: MAX_PANEL_WIDTH },
                        React.createElement(resize_handle_1.DragHandle, null)),
                    !layout.pinboard.hidden && React.createElement(pinboard_panel_1.PinboardPanel, { style: styles.pinboardPanel, clicker: clicker, essence: essence, timekeeper: timekeeper })),
                this.renderDruidQueryModal(),
                this.renderRawDataModal(),
                this.renderViewDefinitionModal(),
                this.renderUrlShortenerModal()),
            this.renderSideDrawer());
    };
    CubeView.prototype.renderSideDrawer = function () {
        var _a = this.props, changeDataCubeAndEssence = _a.changeDataCubeAndEssence, openAboutModal = _a.openAboutModal, appSettings = _a.appSettings;
        var _b = this.state, showSideBar = _b.showSideBar, essence = _b.essence;
        var dataCubes = appSettings.dataCubes, customization = appSettings.customization;
        var transitionTimeout = { enter: 500, exit: 300 };
        return React.createElement(react_transition_group_1.CSSTransition, { in: showSideBar, classNames: "side-drawer", mountOnEnter: true, unmountOnExit: true, timeout: transitionTimeout },
            React.createElement(side_drawer_1.SideDrawer, { key: "drawer", essence: essence, dataCubes: dataCubes, onOpenAbout: openAboutModal, onClose: this.sideDrawerClose, customization: customization, changeDataCubeAndEssence: changeDataCubeAndEssence }));
    };
    CubeView.prototype.calculateStyles = function () {
        var layout = this.state.layout;
        var isDimensionPanelHidden = layout.factPanel.hidden;
        var isPinboardHidden = layout.pinboard.hidden;
        if (this.isSmallDevice()) {
            var dimensionsWidth = isDimensionPanelHidden ? 0 : 200;
            var pinboardWidth = isPinboardHidden ? 0 : 200;
            return {
                dimensionMeasurePanel: { width: dimensionsWidth },
                centerPanel: { left: dimensionsWidth, right: pinboardWidth },
                pinboardPanel: { width: pinboardWidth }
            };
        }
        var nonSmallLayoutPadding = 10;
        return {
            dimensionMeasurePanel: {
                width: isDimensionPanelHidden ? 0 : layout.factPanel.width
            },
            centerPanel: {
                left: isDimensionPanelHidden ? nonSmallLayoutPadding : layout.factPanel.width,
                right: isPinboardHidden ? nonSmallLayoutPadding : layout.pinboard.width
            },
            pinboardPanel: {
                width: isPinboardHidden ? 0 : layout.pinboard.width
            }
        };
    };
    CubeView.prototype.manualFallback = function () {
        var essence = this.state.essence;
        if (!essence.visResolve.isManual())
            return null;
        return React.createElement(manual_fallback_1.ManualFallback, { clicker: this.clicker, essence: essence });
    };
    CubeView.prototype.visElement = function () {
        var _this = this;
        var _a = this.state, essence = _a.essence, stage = _a.visualizationStage, lastRefreshRequestTimestamp = _a.lastRefreshRequestTimestamp;
        if (!(essence.visResolve.isReady() && stage))
            return null;
        var visProps = {
            refreshRequestTimestamp: lastRefreshRequestTimestamp,
            essence: essence,
            clicker: this.clicker,
            timekeeper: this.state.timekeeper,
            stage: stage,
            registerDownloadableDataset: function (dataset) {
                _this.downloadableDataset = { dataset: dataset, options: tabular_options_1.default(essence) };
            }
        };
        return React.createElement(visualizations_1.getVisualizationComponent(essence.visualization), visProps);
    };
    CubeView.defaultProps = { maxFilters: 20 };
    return CubeView;
}(React.Component));
exports.CubeView = CubeView;
//# sourceMappingURL=cube-view.js.map