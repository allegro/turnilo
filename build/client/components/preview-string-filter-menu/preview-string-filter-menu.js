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
var immutable_1 = require("immutable");
var React = require("react");
var filter_clause_1 = require("../../../common/models/filter-clause/filter-clause");
var filter_1 = require("../../../common/models/filter/filter");
var visualization_props_1 = require("../../../common/models/visualization-props/visualization-props");
var functional_1 = require("../../../common/utils/functional/functional");
var preview_string_filter_query_1 = require("../../../common/utils/query/preview-string-filter-query");
var constants_1 = require("../../config/constants");
var dom_1 = require("../../utils/dom/dom");
var error_reporter_1 = require("../../utils/error-reporter/error-reporter");
var button_1 = require("../button/button");
var clearable_input_1 = require("../clearable-input/clearable-input");
var global_event_listener_1 = require("../global-event-listener/global-event-listener");
var loader_1 = require("../loader/loader");
var query_error_1 = require("../query-error/query-error");
var preview_list_1 = require("./preview-list");
require("./preview-string-filter-menu.scss");
function checkRegex(text) {
    try {
        new RegExp(text);
    }
    catch (e) {
        return e.message;
    }
    return null;
}
var TOP_N = 100;
var PreviewStringFilterMenu = (function (_super) {
    __extends(PreviewStringFilterMenu, _super);
    function PreviewStringFilterMenu() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.initialSearchText = function () {
            var _a = _this.props, essence = _a.essence, dimension = _a.dimension;
            var clause = essence.filter.getClauseForDimension(dimension);
            if (clause && clause instanceof filter_clause_1.StringFilterClause && clause.action !== filter_clause_1.StringFilterAction.IN) {
                return clause.values.first();
            }
            return "";
        };
        _this.state = { dataset: visualization_props_1.loading, searchText: _this.initialSearchText() };
        _this.updateSearchText = function (searchText) { return _this.setState({ searchText: searchText }); };
        _this.queryFilter = function (props) {
            var essence = props.essence;
            var searchText = _this.state.searchText;
            var query = preview_string_filter_query_1.previewStringFilterQuery(__assign({}, props, { searchText: searchText, limit: TOP_N + 1 }));
            return essence.dataCube.executor(query, { timezone: essence.timezone })
                .then(function (dataset) {
                if (_this.lastSearchText !== searchText)
                    return null;
                return visualization_props_1.loaded(dataset);
            })
                .catch(function (err) {
                if (_this.lastSearchText !== searchText)
                    return null;
                error_reporter_1.reportError(err);
                return visualization_props_1.error(err);
            });
        };
        _this.debouncedQueryFilter = functional_1.debounceWithPromise(_this.queryFilter, constants_1.SEARCH_WAIT);
        _this.globalKeyDownListener = function (e) {
            if (dom_1.enterKey(e)) {
                _this.onOkClick();
            }
        };
        _this.onOkClick = function () {
            if (!_this.actionEnabled())
                return;
            var _a = _this.props, clicker = _a.clicker, onClose = _a.onClose;
            clicker.changeFilter(_this.constructFilter());
            onClose();
        };
        _this.onCancelClick = function () {
            _this.props.onClose();
        };
        return _this;
    }
    PreviewStringFilterMenu.prototype.loadRows = function () {
        var _this = this;
        if (this.regexErrorMessage())
            return;
        this.setState({ dataset: visualization_props_1.loading });
        this.sendQueryFilter()
            .then(function (dataset) {
            if (!dataset)
                return;
            _this.setState({ dataset: dataset });
        });
    };
    PreviewStringFilterMenu.prototype.sendQueryFilter = function () {
        var searchText = this.state.searchText;
        this.lastSearchText = searchText;
        return this.debouncedQueryFilter(__assign({}, this.props, { searchText: searchText }));
    };
    PreviewStringFilterMenu.prototype.regexErrorMessage = function () {
        var filterMode = this.props.filterMode;
        var searchText = this.state.searchText;
        return filterMode === filter_1.FilterMode.REGEX && searchText && checkRegex(searchText);
    };
    PreviewStringFilterMenu.prototype.componentWillMount = function () {
        this.loadRows();
    };
    PreviewStringFilterMenu.prototype.componentWillUnmount = function () {
        this.debouncedQueryFilter.cancel();
    };
    PreviewStringFilterMenu.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (this.state.searchText !== prevState.searchText) {
            this.loadRows();
        }
    };
    PreviewStringFilterMenu.prototype.constructFilter = function () {
        var _a = this.props, dimension = _a.dimension, filterMode = _a.filterMode, onClauseChange = _a.onClauseChange;
        var searchText = this.state.searchText;
        if (!searchText)
            return null;
        var reference = dimension.name;
        switch (filterMode) {
            case filter_1.FilterMode.CONTAINS:
                return onClauseChange(new filter_clause_1.StringFilterClause({
                    reference: reference,
                    values: immutable_1.Set.of(searchText),
                    action: filter_clause_1.StringFilterAction.CONTAINS
                }));
            case filter_1.FilterMode.REGEX:
                return onClauseChange(new filter_clause_1.StringFilterClause({
                    reference: reference,
                    values: immutable_1.Set.of(searchText),
                    action: filter_clause_1.StringFilterAction.MATCH
                }));
        }
    };
    PreviewStringFilterMenu.prototype.actionEnabled = function () {
        var essence = this.props.essence;
        if (this.regexErrorMessage())
            return false;
        var filter = this.constructFilter();
        return filter && !essence.filter.equals(filter);
    };
    PreviewStringFilterMenu.prototype.render = function () {
        var _a = this.props, filterMode = _a.filterMode, dimension = _a.dimension;
        var _b = this.state, dataset = _b.dataset, searchText = _b.searchText;
        var hasMore = visualization_props_1.isLoaded(dataset) && dataset.dataset.data.length > TOP_N;
        return React.createElement(React.Fragment, null,
            React.createElement(global_event_listener_1.GlobalEventListener, { keyDown: this.globalKeyDownListener }),
            React.createElement("div", { className: "search-box" },
                React.createElement(clearable_input_1.ClearableInput, { placeholder: "Search", focusOnMount: true, value: searchText, onChange: this.updateSearchText })),
            React.createElement("div", { className: "preview-string-filter-menu" },
                React.createElement("div", { className: dom_1.classNames("menu-table", hasMore ? "has-more" : "no-more") },
                    React.createElement("div", { className: "rows" },
                        visualization_props_1.isLoaded(dataset) && React.createElement(preview_list_1.PreviewList, { dimension: dimension, dataset: dataset.dataset, searchText: searchText, regexErrorMessage: this.regexErrorMessage(), limit: TOP_N, filterMode: filterMode }),
                        visualization_props_1.isError(dataset) ? React.createElement(query_error_1.QueryError, { error: dataset.error }) : null,
                        visualization_props_1.isLoading(dataset) ? React.createElement(loader_1.Loader, null) : null)),
                React.createElement("div", { className: "ok-cancel-bar" },
                    React.createElement(button_1.Button, { type: "primary", title: constants_1.STRINGS.ok, onClick: this.onOkClick, disabled: !this.actionEnabled() }),
                    React.createElement(button_1.Button, { type: "secondary", title: constants_1.STRINGS.cancel, onClick: this.onCancelClick }))));
    };
    return PreviewStringFilterMenu;
}(React.Component));
exports.PreviewStringFilterMenu = PreviewStringFilterMenu;
//# sourceMappingURL=preview-string-filter-menu.js.map