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
var selectable_string_filter_query_1 = require("../../../common/utils/query/selectable-string-filter-query");
var constants_1 = require("../../config/constants");
var dom_1 = require("../../utils/dom/dom");
var error_reporter_1 = require("../../utils/error-reporter/error-reporter");
var button_1 = require("../button/button");
var clearable_input_1 = require("../clearable-input/clearable-input");
var global_event_listener_1 = require("../global-event-listener/global-event-listener");
var loader_1 = require("../loader/loader");
var paste_form_1 = require("../paste-form/paste-form");
var query_error_1 = require("../query-error/query-error");
var svg_icon_1 = require("../svg-icon/svg-icon");
require("./selectable-string-filter-menu.scss");
var string_values_list_1 = require("./string-values-list");
var TOP_N = 100;
function toggle(set, value) {
    return set.has(value) ? set.remove(value) : set.add(value);
}
var SelectableStringFilterMenu = (function (_super) {
    __extends(SelectableStringFilterMenu, _super);
    function SelectableStringFilterMenu() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            pasteModeEnabled: false,
            dataset: visualization_props_1.loading,
            selectedValues: _this.initialSelection(),
            searchText: ""
        };
        _this.queryFilter = function (props) {
            var essence = props.essence, searchText = props.searchText;
            var query = selectable_string_filter_query_1.stringFilterOptionsQuery(__assign({}, props, { limit: TOP_N + 1 }));
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
            if (!_this.state.pasteModeEnabled && dom_1.enterKey(e)) {
                _this.onOkClick();
            }
        };
        _this.updateSearchText = function (searchText) { return _this.setState({ searchText: searchText }); };
        _this.onValueClick = function (value, withModKey) {
            var selectedValues = _this.state.selectedValues;
            if (withModKey) {
                var isValueSingleSelected = selectedValues.contains(value) && selectedValues.count() === 1;
                return _this.setState({ selectedValues: isValueSingleSelected ? immutable_1.Set.of() : immutable_1.Set.of(value) });
            }
            return _this.setState({ selectedValues: toggle(selectedValues, value) });
        };
        _this.onOkClick = function () {
            if (!_this.isFilterValid())
                return;
            var _a = _this.props, clicker = _a.clicker, onClose = _a.onClose;
            clicker.changeFilter(_this.constructFilter());
            onClose();
        };
        _this.enablePasteMode = function () { return _this.setState({ pasteModeEnabled: true }); };
        _this.disablePasteMode = function () { return _this.setState({ pasteModeEnabled: false }); };
        _this.selectValues = function (values) { return _this.setState({ selectedValues: values }); };
        return _this;
    }
    SelectableStringFilterMenu.prototype.loadRows = function () {
        var _this = this;
        this.setState({ dataset: visualization_props_1.loading });
        this.sendQueryFilter()
            .then(function (dataset) {
            if (!dataset)
                return;
            _this.setState({ dataset: dataset });
        })
            .catch(function (_) {
            _this.setState({ dataset: visualization_props_1.error(new Error("Unknown error")) });
        });
    };
    SelectableStringFilterMenu.prototype.sendQueryFilter = function () {
        var searchText = this.state.searchText;
        this.lastSearchText = searchText;
        return this.debouncedQueryFilter(__assign({}, this.props, { searchText: searchText }));
    };
    SelectableStringFilterMenu.prototype.componentWillMount = function () {
        this.loadRows();
    };
    SelectableStringFilterMenu.prototype.initialSelection = function () {
        var _a = this.props, filter = _a.essence.filter, dimension = _a.dimension;
        var clause = filter.getClauseForDimension(dimension);
        if (!clause)
            return immutable_1.Set();
        if (!(clause instanceof filter_clause_1.StringFilterClause)) {
            throw new Error("Expected string filter clause, got: " + clause);
        }
        return clause.action === filter_clause_1.StringFilterAction.IN ? clause.values : immutable_1.Set();
    };
    SelectableStringFilterMenu.prototype.componentWillUnmount = function () {
        this.debouncedQueryFilter.cancel();
    };
    SelectableStringFilterMenu.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (this.state.searchText !== prevState.searchText) {
            this.loadRows();
        }
    };
    SelectableStringFilterMenu.prototype.constructFilter = function () {
        var _a = this.props, dimension = _a.dimension, filterMode = _a.filterMode, onClauseChange = _a.onClauseChange;
        var selectedValues = this.state.selectedValues;
        var name = dimension.name;
        if (selectedValues.count() === 0)
            return onClauseChange(null);
        var clause = new filter_clause_1.StringFilterClause({
            action: filter_clause_1.StringFilterAction.IN,
            reference: name,
            values: selectedValues,
            not: filterMode === filter_1.FilterMode.EXCLUDE
        });
        return onClauseChange(clause);
    };
    SelectableStringFilterMenu.prototype.isFilterValid = function () {
        var selectedValues = this.state.selectedValues;
        if (selectedValues.isEmpty())
            return false;
        return !this.props.essence.filter.equals(this.constructFilter());
    };
    SelectableStringFilterMenu.prototype.renderSelectMode = function () {
        var _a = this.props, filterMode = _a.filterMode, onClose = _a.onClose, dimension = _a.dimension;
        var _b = this.state, dataset = _b.dataset, selectedValues = _b.selectedValues, searchText = _b.searchText;
        var hasMore = visualization_props_1.isLoaded(dataset) && dataset.dataset.data.length > TOP_N;
        return React.createElement(React.Fragment, null,
            React.createElement("div", { className: "paste-icon", onClick: this.enablePasteMode, title: "Paste multiple values" },
                React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/full-multi.svg") })),
            React.createElement("div", { className: "search-box" },
                React.createElement(clearable_input_1.ClearableInput, { placeholder: "Search", focusOnMount: true, value: searchText, onChange: this.updateSearchText })),
            React.createElement("div", { className: dom_1.classNames("selectable-string-filter-menu", filterMode) },
                React.createElement("div", { className: dom_1.classNames("menu-table", hasMore ? "has-more" : "no-more") },
                    React.createElement("div", { className: "rows" },
                        visualization_props_1.isLoaded(dataset) && React.createElement(string_values_list_1.StringValuesList, { onRowSelect: this.onValueClick, dimension: dimension, dataset: dataset.dataset, searchText: searchText, limit: TOP_N, selectedValues: selectedValues, promotedValues: this.initialSelection(), filterMode: filterMode }),
                        visualization_props_1.isError(dataset) && React.createElement(query_error_1.QueryError, { error: dataset.error }),
                        visualization_props_1.isLoading(dataset) && React.createElement(loader_1.Loader, null))),
                React.createElement("div", { className: "ok-cancel-bar" },
                    React.createElement(button_1.Button, { type: "primary", title: constants_1.STRINGS.ok, onClick: this.onOkClick, disabled: !this.isFilterValid() }),
                    React.createElement(button_1.Button, { type: "secondary", title: constants_1.STRINGS.cancel, onClick: onClose }))));
    };
    SelectableStringFilterMenu.prototype.renderImportMode = function () {
        return React.createElement(React.Fragment, null,
            React.createElement("div", { className: "paste-prompt" }, "Paste values separated by newlines"),
            React.createElement("div", { className: "paste-form" },
                React.createElement(paste_form_1.PasteForm, { onSelect: this.selectValues, onClose: this.disablePasteMode })));
    };
    SelectableStringFilterMenu.prototype.render = function () {
        var pasteModeEnabled = this.state.pasteModeEnabled;
        return React.createElement(React.Fragment, null,
            React.createElement(global_event_listener_1.GlobalEventListener, { keyDown: this.globalKeyDownListener }),
            pasteModeEnabled ? this.renderImportMode() : this.renderSelectMode());
    };
    return SelectableStringFilterMenu;
}(React.Component));
exports.SelectableStringFilterMenu = SelectableStringFilterMenu;
//# sourceMappingURL=selectable-string-filter-menu.js.map