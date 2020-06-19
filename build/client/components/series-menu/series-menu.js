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
var React = require("react");
var concreteArithmeticOperation_1 = require("../../../common/models/expression/concreteArithmeticOperation");
var percent_1 = require("../../../common/models/expression/percent");
var expression_series_1 = require("../../../common/models/series/expression-series");
var measure_series_1 = require("../../../common/models/series/measure-series");
var quantile_series_1 = require("../../../common/models/series/quantile-series");
var stage_1 = require("../../../common/models/stage/stage");
var general_1 = require("../../../common/utils/general/general");
var constants_1 = require("../../config/constants");
var dom_1 = require("../../utils/dom/dom");
var bubble_menu_1 = require("../bubble-menu/bubble-menu");
var button_1 = require("../button/button");
var arithmetic_series_menu_1 = require("./arithmetic-series-menu");
var measure_series_menu_1 = require("./measure-series-menu");
var percent_series_menu_1 = require("./percent-series-menu");
var quantile_series_menu_1 = require("./quantile-series-menu");
require("./series-menu.scss");
var SeriesMenu = (function (_super) {
    __extends(SeriesMenu, _super);
    function SeriesMenu() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { series: _this.props.initialSeries, isValid: true };
        _this.globalKeyDownListener = function (e) { return dom_1.enterKey(e) && _this.onOkClick(); };
        _this.saveSeries = function (series, isValid) { return _this.setState({ series: series, isValid: isValid }); };
        _this.onCancelClick = function () { return _this.props.onClose(); };
        _this.onOkClick = function () {
            if (!_this.validate())
                return;
            var _a = _this.props, saveSeries = _a.saveSeries, onClose = _a.onClose;
            var series = _this.state.series;
            saveSeries(series);
            onClose();
        };
        return _this;
    }
    SeriesMenu.prototype.componentDidMount = function () {
        window.addEventListener("keydown", this.globalKeyDownListener);
    };
    SeriesMenu.prototype.componentWillUnmount = function () {
        window.removeEventListener("keydown", this.globalKeyDownListener);
    };
    SeriesMenu.prototype.validate = function () {
        var _a = this.state, isValid = _a.isValid, series = _a.series;
        var _b = this.props, initialSeries = _b.initialSeries, seriesList = _b.seriesList;
        var isModified = !initialSeries.equals(series);
        var otherSeries = seriesList.series.filter(function (s) { return !s.equals(initialSeries); });
        var isUnique = !general_1.isTruthy(otherSeries.find(function (s) { return s.key() === series.key(); }));
        return isValid && isModified && isUnique;
    };
    SeriesMenu.prototype.render = function () {
        var _a = this.props, measure = _a.measure, measures = _a.measures, initialSeries = _a.initialSeries, seriesList = _a.seriesList, containerStage = _a.containerStage, onClose = _a.onClose, openOn = _a.openOn;
        var series = this.state.series;
        return React.createElement(bubble_menu_1.BubbleMenu, { className: "series-menu", direction: "down", containerStage: containerStage, stage: stage_1.Stage.fromSize(250, 240), openOn: openOn, onClose: onClose },
            series instanceof measure_series_1.MeasureSeries && React.createElement(measure_series_menu_1.MeasureSeriesMenu, { series: series, measure: measure, onChange: this.saveSeries }),
            series instanceof expression_series_1.ExpressionSeries && series.expression instanceof percent_1.PercentExpression && React.createElement(percent_series_menu_1.PercentSeriesMenu, { seriesList: seriesList, series: series, measure: measure, onChange: this.saveSeries }),
            series instanceof expression_series_1.ExpressionSeries && series.expression instanceof concreteArithmeticOperation_1.ArithmeticExpression && React.createElement(arithmetic_series_menu_1.ArithmeticSeriesMenu, { seriesList: seriesList, series: series, initialSeries: initialSeries, measure: measure, measures: measures, onChange: this.saveSeries }),
            series instanceof quantile_series_1.QuantileSeries && React.createElement(quantile_series_menu_1.QuantileSeriesMenu, { seriesList: seriesList, measure: measure, onChange: this.saveSeries, initialSeries: initialSeries, series: series }),
            React.createElement("div", { className: "button-bar" },
                React.createElement(button_1.Button, { className: "ok", type: "primary", disabled: !this.validate(), onClick: this.onOkClick, title: constants_1.STRINGS.ok }),
                React.createElement(button_1.Button, { type: "secondary", onClick: this.onCancelClick, title: constants_1.STRINGS.cancel })));
    };
    return SeriesMenu;
}(React.Component));
exports.SeriesMenu = SeriesMenu;
//# sourceMappingURL=series-menu.js.map