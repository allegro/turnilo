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
var plywood_1 = require("plywood");
var React = require("react");
var filter_clause_1 = require("../../../../common/models/filter-clause/filter-clause");
var stage_1 = require("../../../../common/models/stage/stage");
var constants_1 = require("../../../config/constants");
var bubble_menu_1 = require("../../bubble-menu/bubble-menu");
var button_1 = require("../../button/button");
var checkbox_1 = require("../../checkbox/checkbox");
var loader_1 = require("../../loader/loader");
var query_error_1 = require("../../query-error/query-error");
require("./boolean-filter-menu.scss");
var BooleanFilterMenu = (function (_super) {
    __extends(BooleanFilterMenu, _super);
    function BooleanFilterMenu() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = _this.initialValues();
        _this.onOkClick = function () {
            if (!_this.actionEnabled())
                return;
            var _a = _this.props, clicker = _a.clicker, onClose = _a.onClose;
            clicker.changeFilter(_this.constructFilter());
            onClose();
        };
        _this.onCancelClick = function () {
            var onClose = _this.props.onClose;
            onClose();
        };
        _this.selectValue = function (value) {
            var selectedValues = _this.state.selectedValues;
            var newSelection = selectedValues.has(value) ? selectedValues.remove(value) : selectedValues.add(value);
            _this.setState({ selectedValues: newSelection });
        };
        _this.renderRow = function (value) {
            var selectedValues = _this.state.selectedValues;
            return React.createElement("div", { className: "row", key: value.toString(), title: value.toString(), onClick: function () { return _this.selectValue(value); } },
                React.createElement("div", { className: "row-wrapper" },
                    React.createElement(checkbox_1.Checkbox, { selected: selectedValues.has(value) }),
                    React.createElement("span", { className: "label" }, value.toString())));
        };
        return _this;
    }
    BooleanFilterMenu.prototype.initialValues = function () {
        var _a = this.props, filter = _a.essence.filter, dimension = _a.dimension;
        var clause = filter.getClauseForDimension(dimension);
        if (!clause) {
            return { selectedValues: immutable_1.Set.of(), values: [] };
        }
        if (!(clause instanceof filter_clause_1.BooleanFilterClause)) {
            throw new Error("Expected boolean filter clause, got: " + clause);
        }
        return { selectedValues: clause.values, values: [] };
    };
    BooleanFilterMenu.prototype.componentDidMount = function () {
        this.fetchData();
    };
    BooleanFilterMenu.prototype.fetchData = function () {
        var _this = this;
        var _a = this.props, essence = _a.essence, timekeeper = _a.timekeeper, dimension = _a.dimension;
        var dataCube = essence.dataCube;
        var filterExpression = essence.getEffectiveFilter(timekeeper, { unfilterDimension: dimension }).toExpression(dataCube);
        var query = plywood_1.$("main")
            .filter(filterExpression)
            .split(dimension.expression, dimension.name);
        this.setState({ loading: true });
        dataCube.executor(query, { timezone: essence.timezone })
            .then(function (dataset) {
            _this.setState({
                loading: false,
                values: dataset.data.map(function (d) { return d[dimension.name]; }),
                error: null
            });
        }, function (error) {
            _this.setState({
                loading: false,
                values: [],
                error: error
            });
        });
    };
    BooleanFilterMenu.prototype.constructFilter = function () {
        var selectedValues = this.state.selectedValues;
        if (selectedValues.isEmpty())
            return null;
        var _a = this.props, filter = _a.essence.filter, dimension = _a.dimension;
        return filter.setClause(new filter_clause_1.BooleanFilterClause({
            reference: dimension.name,
            values: selectedValues
        }));
    };
    BooleanFilterMenu.prototype.actionEnabled = function () {
        var essence = this.props.essence;
        var filter = this.constructFilter();
        return Boolean(filter) && !essence.filter.equals(filter);
    };
    BooleanFilterMenu.prototype.render = function () {
        var _a = this.props, onClose = _a.onClose, containerStage = _a.containerStage, openOn = _a.openOn, inside = _a.inside;
        var _b = this.state, values = _b.values, error = _b.error, loading = _b.loading;
        return React.createElement(bubble_menu_1.BubbleMenu, { className: "boolean-filter-menu", direction: "down", containerStage: containerStage, stage: stage_1.Stage.fromSize(250, 210), openOn: openOn, onClose: onClose, inside: inside },
            React.createElement("div", { className: "menu-table" },
                React.createElement("div", { className: "rows" }, values.map(this.renderRow)),
                error && React.createElement(query_error_1.QueryError, { error: error }),
                loading && React.createElement(loader_1.Loader, null)),
            React.createElement("div", { className: "ok-cancel-bar" },
                React.createElement(button_1.Button, { type: "primary", title: constants_1.STRINGS.ok, onClick: this.onOkClick, disabled: !this.actionEnabled() }),
                React.createElement(button_1.Button, { type: "secondary", title: constants_1.STRINGS.cancel, onClick: this.onCancelClick })));
    };
    return BooleanFilterMenu;
}(React.Component));
exports.BooleanFilterMenu = BooleanFilterMenu;
//# sourceMappingURL=boolean-filter-menu.js.map