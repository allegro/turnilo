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
var visualization_props_1 = require("../../../common/models/visualization-props/visualization-props");
var functional_1 = require("../../../common/utils/functional/functional");
var visualization_query_1 = require("../../../common/utils/query/visualization-query");
var global_event_listener_1 = require("../../components/global-event-listener/global-event-listener");
var loader_1 = require("../../components/loader/loader");
var query_error_1 = require("../../components/query-error/query-error");
var dom_1 = require("../../utils/dom/dom");
var error_reporter_1 = require("../../utils/error-reporter/error-reporter");
require("./base-visualization.scss");
var highlight_1 = require("./highlight");
var BaseVisualization = (function (_super) {
    __extends(BaseVisualization, _super);
    function BaseVisualization(props) {
        var _this = _super.call(this, props) || this;
        _this.className = null;
        _this.globalMouseMoveListener = functional_1.noop;
        _this.globalMouseUpListener = functional_1.noop;
        _this.globalKeyDownListener = functional_1.noop;
        _this.lastQueryEssence = null;
        _this.callExecutor = function (essence, timekeeper) {
            return essence.dataCube.executor(visualization_query_1.default(essence, timekeeper), { timezone: essence.timezone })
                .then(function (dataset) {
                if (!_this.wasUsedForLastQuery(essence))
                    return null;
                return visualization_props_1.loaded(dataset);
            }, function (err) {
                if (!_this.wasUsedForLastQuery(essence))
                    return null;
                error_reporter_1.reportError(err);
                return visualization_props_1.error(err);
            });
        };
        _this.debouncedCallExecutor = functional_1.debounceWithPromise(_this.callExecutor, 500);
        _this.dropHighlight = function () { return _this.setState({ highlight: null }); };
        _this.acceptHighlight = function () {
            if (!_this.hasHighlight())
                return;
            var _a = _this.props, essence = _a.essence, clicker = _a.clicker;
            clicker.changeFilter(essence.filter.mergeClauses(_this.getHighlightClauses()));
            _this.setState({ highlight: null });
        };
        _this.highlight = function (clauses, key) {
            if (key === void 0) { key = null; }
            var highlight = new highlight_1.Highlight(clauses, key);
            _this.setState({ highlight: highlight });
        };
        _this.state = _this.getDefaultState();
        return _this;
    }
    BaseVisualization.prototype.getDefaultState = function () {
        return {
            datasetLoad: visualization_props_1.loading,
            scrollLeft: 0,
            scrollTop: 0,
            highlight: null,
            dragOnSeries: null
        };
    };
    BaseVisualization.prototype.componentDidMount = function () {
        var _a = this.props, essence = _a.essence, timekeeper = _a.timekeeper;
        this.loadData(essence, timekeeper);
    };
    BaseVisualization.prototype.componentWillUnmount = function () {
        this.lastQueryEssence = null;
        this.debouncedCallExecutor.cancel();
    };
    BaseVisualization.prototype.componentWillReceiveProps = function (nextProps) {
        if (this.shouldFetchData(nextProps) && this.visualisationNotResized(nextProps)) {
            var essence = nextProps.essence, timekeeper = nextProps.timekeeper;
            var hadDataLoaded = visualization_props_1.isLoaded(this.state.datasetLoad);
            var essenceChanged = !essence.equals(this.props.essence);
            this.loadData(essence, timekeeper, hadDataLoaded && essenceChanged);
        }
    };
    BaseVisualization.prototype.loadData = function (essence, timekeeper, showSpinner) {
        var _this = this;
        if (showSpinner === void 0) { showSpinner = true; }
        if (showSpinner)
            this.handleDatasetLoad(visualization_props_1.loading);
        this.fetchData(essence, timekeeper)
            .then(function (loadedDataset) {
            if (!loadedDataset)
                return;
            if (visualization_props_1.isError(loadedDataset)) {
                _this.handleDatasetLoad(loadedDataset);
            }
            if (visualization_props_1.isLoaded(loadedDataset)) {
                _this.handleDatasetLoad(loadedDataset, _this.deriveDatasetState(loadedDataset.dataset));
            }
        });
    };
    BaseVisualization.prototype.fetchData = function (essence, timekeeper) {
        this.lastQueryEssence = essence;
        return this.debouncedCallExecutor(essence, timekeeper);
    };
    BaseVisualization.prototype.wasUsedForLastQuery = function (essence) {
        return essence.equals(this.lastQueryEssence);
    };
    BaseVisualization.prototype.handleDatasetLoad = function (dl, derivedState) {
        if (derivedState === void 0) { derivedState = {}; }
        this.setState(__assign({}, derivedState, { datasetLoad: dl, scrollLeft: 0, scrollTop: 0 }));
        var registerDownloadableDataset = this.props.registerDownloadableDataset;
        if (registerDownloadableDataset) {
            registerDownloadableDataset(visualization_props_1.isLoaded(dl) ? dl.dataset : null);
        }
    };
    BaseVisualization.prototype.shouldFetchData = function (nextProps) {
        return this.differentVisualizationDefinition(nextProps);
    };
    BaseVisualization.prototype.differentVisualizationDefinition = function (nextProps) {
        var _a = this.props, essence = _a.essence, timekeeper = _a.timekeeper;
        var nextEssence = nextProps.essence;
        var nextTimekeeper = nextProps.timekeeper;
        return nextEssence.differentDataCube(essence) ||
            nextEssence.differentEffectiveFilter(essence, timekeeper, nextTimekeeper) ||
            nextEssence.differentTimeShift(essence) ||
            nextEssence.differentSplits(essence) ||
            nextEssence.differentSeries(essence) ||
            nextEssence.differentSettings(essence) ||
            this.differentBucketingTimezone(nextEssence) ||
            this.differentLastRefreshRequestTimestamp(nextProps);
    };
    BaseVisualization.prototype.differentBucketingTimezone = function (newEssence) {
        var essence = this.props.essence;
        return !essence.timezone.equals(newEssence.timezone) && newEssence.splits.hasSplitOn(essence.getTimeDimension());
    };
    BaseVisualization.prototype.differentLastRefreshRequestTimestamp = function (_a) {
        var refreshRequestTimestamp = _a.refreshRequestTimestamp;
        return refreshRequestTimestamp !== this.props.refreshRequestTimestamp;
    };
    BaseVisualization.prototype.visualisationNotResized = function (nextProps) {
        return this.props.stage.equals(nextProps.stage);
    };
    BaseVisualization.prototype.renderInternals = function (dataset) {
        return null;
    };
    BaseVisualization.prototype.getHighlight = function () {
        return this.state.highlight;
    };
    BaseVisualization.prototype.hasHighlight = function () {
        return this.state.highlight !== null;
    };
    BaseVisualization.prototype.highlightOn = function (key) {
        var highlight = this.getHighlight();
        if (!highlight)
            return false;
        return highlight.key === key;
    };
    BaseVisualization.prototype.getHighlightClauses = function () {
        var highlight = this.getHighlight();
        if (!highlight)
            return null;
        return highlight.clauses;
    };
    BaseVisualization.prototype.deriveDatasetState = function (dataset) {
        return {};
    };
    BaseVisualization.prototype.render = function () {
        var datasetLoad = this.state.datasetLoad;
        return React.createElement("div", { className: dom_1.classNames("base-visualization", this.className) },
            React.createElement(global_event_listener_1.GlobalEventListener, { mouseMove: this.globalMouseMoveListener, mouseUp: this.globalMouseUpListener, keyDown: this.globalKeyDownListener }),
            visualization_props_1.isLoaded(datasetLoad) && this.renderInternals(datasetLoad.dataset),
            visualization_props_1.isError(datasetLoad) && React.createElement(query_error_1.QueryError, { error: datasetLoad.error }),
            visualization_props_1.isLoading(datasetLoad) && React.createElement(loader_1.Loader, null));
    };
    return BaseVisualization;
}(React.Component));
exports.BaseVisualization = BaseVisualization;
//# sourceMappingURL=base-visualization.js.map