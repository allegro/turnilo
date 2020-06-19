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
var filter_clause_1 = require("../../../common/models/filter-clause/filter-clause");
var visualization_props_1 = require("../../../common/models/visualization-props/visualization-props");
var functional_1 = require("../../../common/utils/functional/functional");
var constants_1 = require("../../config/constants");
var dom_1 = require("../../utils/dom/dom");
var drag_manager_1 = require("../../utils/drag-manager/drag-manager");
var error_reporter_1 = require("../../utils/error-reporter/error-reporter");
var loader_1 = require("../loader/loader");
var query_error_1 = require("../query-error/query-error");
var searchable_tile_1 = require("../searchable-tile/searchable-tile");
var pinboard_dataset_1 = require("./pinboard-dataset");
var pinboard_icons_1 = require("./pinboard-icons");
require("./pinboard-tile.scss");
var is_clause_editable_1 = require("./utils/is-clause-editable");
var is_dimension_pinnable_1 = require("./utils/is-dimension-pinnable");
var make_query_1 = require("./utils/make-query");
var pinnable_clause_1 = require("./utils/pinnable-clause");
var query_params_1 = require("./utils/query-params");
var row_mode_1 = require("./utils/row-mode");
var should_fetch_1 = require("./utils/should-fetch");
var tile_styles_1 = require("./utils/tile-styles");
var PinboardTileProps = (function () {
    function PinboardTileProps() {
    }
    return PinboardTileProps;
}());
exports.PinboardTileProps = PinboardTileProps;
var noMeasureError = new Error("No measure selected");
var PinboardTile = (function (_super) {
    __extends(PinboardTile, _super);
    function PinboardTile() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            searchText: "",
            showSearch: false,
            datasetLoad: visualization_props_1.loading
        };
        _this.lastQueryParams = {};
        _this.callExecutor = function (params) {
            var _a = params.essence, timezone = _a.timezone, dataCube = _a.dataCube;
            return dataCube.executor(make_query_1.makeQuery(params), { timezone: timezone })
                .then(function (dataset) {
                if (!query_params_1.equalParams(params, _this.lastQueryParams))
                    return null;
                return visualization_props_1.loaded(dataset);
            }, function (err) {
                if (!query_params_1.equalParams(params, _this.lastQueryParams))
                    return null;
                error_reporter_1.reportError(err);
                return visualization_props_1.error(err);
            });
        };
        _this.debouncedCallExecutor = functional_1.debounceWithPromise(_this.callExecutor, 500);
        _this.onDragStart = function (e) {
            var dimension = _this.props.dimension;
            var dataTransfer = e.dataTransfer;
            dataTransfer.effectAllowed = "all";
            dom_1.setDragData(dataTransfer, "text/plain", dimension.title);
            drag_manager_1.DragManager.setDragDimension(dimension);
            dom_1.setDragGhost(dataTransfer, dimension.title);
        };
        _this.toggleSearch = function () {
            _this.setState(function (_a) {
                var showSearch = _a.showSearch;
                return ({ showSearch: !showSearch });
            });
            _this.setSearchText("");
        };
        _this.setSearchText = function (text) {
            var searchText = text.substr(0, constants_1.MAX_SEARCH_LENGTH);
            _this.setState({ searchText: searchText });
        };
        _this.unpin = function () {
            var _a = _this.props, clicker = _a.clicker, dimension = _a.dimension;
            clicker.unpin(dimension);
        };
        _this.toggleFilterValue = function (value) {
            var clause = _this.pinnedClause();
            if (!pinnable_clause_1.isPinnableClause(clause))
                throw Error("Expected Boolean or String filter clause, got " + clause);
            var updater = function (values) { return values.has(value) ? values.remove(value) : values.add(value); };
            var newClause = clause instanceof filter_clause_1.StringFilterClause ? clause.update("values", updater) : clause.update("values", updater);
            if (newClause.values.isEmpty()) {
                _this.removeClause(newClause);
            }
            else {
                _this.updateClause(newClause);
            }
        };
        _this.createFilterClause = function (value) {
            var dimension = _this.props.dimension;
            var reference = dimension.name;
            var values = immutable_1.Set.of(value);
            var clause = dimension.kind === "string"
                ? new filter_clause_1.StringFilterClause({ reference: reference, action: filter_clause_1.StringFilterAction.IN, values: values })
                : new filter_clause_1.BooleanFilterClause({ reference: reference, values: values });
            _this.addClause(clause);
        };
        return _this;
    }
    PinboardTile.prototype.loadData = function (params) {
        var _this = this;
        this.setState({ datasetLoad: visualization_props_1.loading });
        this.fetchData(params)
            .then(function (loadedDataset) {
            if (!loadedDataset)
                return;
            _this.setState({ datasetLoad: loadedDataset });
        });
    };
    PinboardTile.prototype.fetchData = function (params) {
        this.lastQueryParams = params;
        return this.debouncedCallExecutor(params);
    };
    PinboardTile.prototype.componentDidMount = function () {
        var _a = this.props, essence = _a.essence, timekeeper = _a.timekeeper, dimension = _a.dimension, sortOn = _a.sortOn;
        this.loadData({ essence: essence, timekeeper: timekeeper, dimension: dimension, sortOn: sortOn, searchText: "" });
    };
    PinboardTile.prototype.componentWillUnmount = function () {
        this.debouncedCallExecutor.cancel();
    };
    PinboardTile.prototype.componentDidUpdate = function (previousProps, previousState) {
        if (should_fetch_1.shouldFetchData(this.props, previousProps, this.state, previousState)) {
            var _a = this.props, essence = _a.essence, timekeeper = _a.timekeeper, dimension = _a.dimension, sortOn = _a.sortOn;
            var searchText = this.state.searchText;
            this.loadData({ essence: essence, timekeeper: timekeeper, dimension: dimension, sortOn: sortOn, searchText: searchText });
        }
    };
    PinboardTile.prototype.getFormatter = function () {
        var _a = this.props, sortOn = _a.sortOn, essence = _a.essence;
        var series = essence.findConcreteSeries(sortOn.key);
        return function (d) { return series.formatValue(d); };
    };
    PinboardTile.prototype.isEditable = function () {
        var clause = this.pinnedClause();
        return clause ? is_clause_editable_1.isClauseEditable(clause) : is_dimension_pinnable_1.isDimensionPinnable(this.props.dimension);
    };
    PinboardTile.prototype.isInEdit = function () {
        var clause = this.pinnedClause();
        return clause && is_clause_editable_1.isClauseEditable(clause) && !clause.values.isEmpty();
    };
    PinboardTile.prototype.pinnedClause = function () {
        var _a = this.props, filter = _a.essence.filter, dimension = _a.dimension;
        var clause = filter.getClauseForDimension(dimension);
        if (pinnable_clause_1.isPinnableClause(clause))
            return clause;
        return null;
    };
    PinboardTile.prototype.addClause = function (clause) {
        var _a = this.props, clicker = _a.clicker, filter = _a.essence.filter;
        clicker.changeFilter(filter.addClause(clause));
    };
    PinboardTile.prototype.removeClause = function (clause) {
        var _a = this.props, clicker = _a.clicker, filter = _a.essence.filter;
        clicker.changeFilter(filter.removeClause(clause.reference));
    };
    PinboardTile.prototype.updateClause = function (clause) {
        var _a = this.props, clicker = _a.clicker, filter = _a.essence.filter;
        clicker.changeFilter(filter.setClause(clause));
    };
    PinboardTile.prototype.getRowMode = function () {
        if (this.isInEdit()) {
            return {
                mode: row_mode_1.RowModeId.EDITABLE,
                state: row_mode_1.EditState.IN_EDIT,
                toggleValue: this.toggleFilterValue,
                clause: this.pinnedClause()
            };
        }
        if (this.isEditable()) {
            return {
                mode: row_mode_1.RowModeId.EDITABLE,
                state: row_mode_1.EditState.READY,
                createClause: this.createFilterClause
            };
        }
        return { mode: row_mode_1.RowModeId.READONLY };
    };
    PinboardTile.prototype.render = function () {
        var dimension = this.props.dimension;
        var _a = this.state, datasetLoad = _a.datasetLoad, showSearch = _a.showSearch, searchText = _a.searchText;
        return React.createElement(searchable_tile_1.SearchableTile, { style: tile_styles_1.tileStyles(datasetLoad), title: dimension.title, toggleChangeFn: this.toggleSearch, onDragStart: this.onDragStart, onSearchChange: this.setSearchText, searchText: searchText, showSearch: showSearch, icons: pinboard_icons_1.pinboardIcons({ showSearch: showSearch, onClose: this.unpin, onSearchClick: this.toggleSearch }), className: "pinboard-tile" },
            visualization_props_1.isLoaded(datasetLoad) && React.createElement(pinboard_dataset_1.PinboardDataset, { rowMode: this.getRowMode(), data: datasetLoad.dataset.data, searchText: searchText, dimension: dimension, formatter: this.getFormatter() }),
            visualization_props_1.isError(datasetLoad) && React.createElement(query_error_1.QueryError, { error: datasetLoad.error }),
            visualization_props_1.isLoading(datasetLoad) && React.createElement(loader_1.Loader, null));
    };
    return PinboardTile;
}(React.Component));
exports.PinboardTile = PinboardTile;
//# sourceMappingURL=pinboard-tile.js.map