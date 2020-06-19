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
var chronoshift_1 = require("chronoshift");
var plywood_1 = require("plywood");
var React = require("react");
var formatter_1 = require("../../../common/utils/formatter/formatter");
var general_1 = require("../../../common/utils/general/general");
var button_1 = require("../../components/button/button");
var loader_1 = require("../../components/loader/loader");
var modal_1 = require("../../components/modal/modal");
var query_error_1 = require("../../components/query-error/query-error");
var scroller_1 = require("../../components/scroller/scroller");
var constants_1 = require("../../config/constants");
var dom_1 = require("../../utils/dom/dom");
var download_1 = require("../../utils/download/download");
var sizing_1 = require("../../utils/sizing/sizing");
var tabular_options_1 = require("../../utils/tabular-options/tabular-options");
require("./raw-data-modal.scss");
var HEADER_HEIGHT = 30;
var ROW_HEIGHT = 30;
var LIMIT = 100;
var TIME_COL_WIDTH = 180;
var BOOLEAN_COL_WIDTH = 100;
var NUMBER_COL_WIDTH = 100;
var DEFAULT_COL_WIDTH = 200;
function getColumnWidth(attribute) {
    switch (attribute.type) {
        case "BOOLEAN":
            return BOOLEAN_COL_WIDTH;
        case "NUMBER":
            return NUMBER_COL_WIDTH;
        case "TIME":
            return TIME_COL_WIDTH;
        default:
            return DEFAULT_COL_WIDTH;
    }
}
function classFromAttribute(attribute) {
    return dom_1.classNames(String(attribute.type).toLowerCase().replace(/\//g, "-"), { unsplitable: attribute.unsplitable });
}
var RawDataModal = (function (_super) {
    __extends(RawDataModal, _super);
    function RawDataModal(props) {
        var _this = _super.call(this, props) || this;
        _this.onScrollerViewportUpdate = function (viewPortStage) {
            if (!viewPortStage.equals(_this.state.stage)) {
                _this.setState({
                    stage: viewPortStage
                });
            }
        };
        _this.onScroll = function (scrollTop, scrollLeft) {
            _this.setState({ scrollLeft: scrollLeft, scrollTop: scrollTop });
        };
        _this.state = {
            loading: false,
            dataset: null,
            scrollLeft: 0,
            scrollTop: 0,
            error: null,
            stage: null
        };
        return _this;
    }
    RawDataModal.prototype.componentDidMount = function () {
        this.mounted = true;
        var _a = this.props, essence = _a.essence, timekeeper = _a.timekeeper;
        this.fetchData(essence, timekeeper);
    };
    RawDataModal.prototype.componentWillUnmount = function () {
        this.mounted = false;
    };
    RawDataModal.prototype.fetchData = function (essence, timekeeper) {
        var _this = this;
        var dataCube = essence.dataCube;
        var $main = plywood_1.$("main");
        var query = $main.filter(essence.getEffectiveFilter(timekeeper).toExpression(dataCube)).limit(LIMIT);
        this.setState({ loading: true });
        dataCube.executor(query, { timezone: essence.timezone })
            .then(function (dataset) {
            if (!_this.mounted)
                return;
            _this.setState({
                dataset: dataset,
                loading: false
            });
        }, function (error) {
            if (!_this.mounted)
                return;
            _this.setState({
                error: error,
                loading: false
            });
        });
    };
    RawDataModal.prototype.getStringifiedFilters = function () {
        var _a = this.props, essence = _a.essence, timekeeper = _a.timekeeper;
        var dataCube = essence.dataCube;
        return essence.getEffectiveFilter(timekeeper).clauses.map(function (clause) {
            var dimension = dataCube.getDimension(clause.reference);
            if (!dimension)
                return null;
            return formatter_1.formatFilterClause(dimension, clause, essence.timezone);
        }).toList();
    };
    RawDataModal.prototype.getSortedAttributes = function (dataCube) {
        var timeAttributeName = dataCube.timeAttribute ? dataCube.timeAttribute.name : null;
        var attributeRank = function (attribute) {
            var name = attribute.name;
            if (name === timeAttributeName) {
                return 1;
            }
            else if (attribute.unsplitable) {
                return 3;
            }
            else {
                return 2;
            }
        };
        return dataCube.attributes.sort(function (a1, a2) {
            var score1 = attributeRank(a1);
            var score2 = attributeRank(a2);
            if (score1 === score2) {
                return a1.name.toLowerCase().localeCompare(a2.name.toLowerCase());
            }
            return score1 - score2;
        });
    };
    RawDataModal.prototype.renderFilters = function () {
        var filters = this.getStringifiedFilters().map(function (filter, i) {
            return React.createElement("li", { className: "filter", key: i }, filter);
        }).toList();
        var limit = React.createElement("li", { className: "limit", key: "limit" },
            "First ",
            LIMIT,
            " events matching ");
        return filters.unshift(limit);
    };
    RawDataModal.prototype.renderHeader = function () {
        var essence = this.props.essence;
        var dataset = this.state.dataset;
        if (!dataset)
            return null;
        var dataCube = essence.dataCube;
        var attributes = this.getSortedAttributes(dataCube);
        return attributes.map(function (attribute, i) {
            var name = attribute.name;
            var width = getColumnWidth(attribute);
            var style = { width: width };
            return (React.createElement("div", { className: dom_1.classNames("header-cell", classFromAttribute(attribute)), style: style, key: i },
                React.createElement("div", { className: "title-wrap" }, general_1.makeTitle(name))));
        });
    };
    RawDataModal.prototype.getVisibleIndices = function (rowCount, height) {
        var scrollTop = this.state.scrollTop;
        return [
            Math.max(0, Math.floor(scrollTop / ROW_HEIGHT)),
            Math.min(rowCount, Math.ceil((scrollTop + height) / ROW_HEIGHT))
        ];
    };
    RawDataModal.prototype.renderRows = function () {
        var essence = this.props.essence;
        var _a = this.state, dataset = _a.dataset, scrollLeft = _a.scrollLeft, stage = _a.stage;
        if (!dataset)
            return null;
        var dataCube = essence.dataCube;
        var rawData = dataset.data;
        var _b = this.getVisibleIndices(rawData.length, stage.height), firstRowToShow = _b[0], lastRowToShow = _b[1];
        var rows = rawData.slice(firstRowToShow, lastRowToShow);
        var attributes = this.getSortedAttributes(dataCube);
        var attributeWidths = attributes.map(getColumnWidth);
        var _c = sizing_1.getVisibleSegments(attributeWidths, scrollLeft, stage.width), startIndex = _c.startIndex, shownColumns = _c.shownColumns;
        var leftOffset = general_1.arraySum(attributeWidths.slice(0, startIndex));
        attributes = attributes.slice(startIndex, startIndex + shownColumns);
        var rowY = firstRowToShow * ROW_HEIGHT;
        return rows.map(function (datum, i) {
            var cols = [];
            attributes.forEach(function (attribute) {
                var name = attribute.name;
                var datumAttribute = datum[name];
                var value = (datumAttribute instanceof plywood_1.Expression) ? datumAttribute.resolve(datum).simplify() : datum[name];
                var colStyle = {
                    width: getColumnWidth(attribute)
                };
                var displayValue = value;
                if (chronoshift_1.isDate(datum[name])) {
                    displayValue = datum[name].toISOString();
                }
                cols.push(React.createElement("div", { className: dom_1.classNames("cell", classFromAttribute(attribute)), key: name, style: colStyle },
                    React.createElement("span", { className: "cell-value" }, String(displayValue))));
            });
            var rowStyle = { top: rowY, left: leftOffset };
            rowY += ROW_HEIGHT;
            return React.createElement("div", { className: "row", style: rowStyle, key: i }, cols);
        });
    };
    RawDataModal.prototype.renderButtons = function () {
        var _this = this;
        var _a = this.state, loading = _a.loading, error = _a.error;
        var onClose = this.props.onClose;
        var buttons = [];
        buttons.push(React.createElement(button_1.Button, { type: "primary", key: "close", className: "close", onClick: onClose, title: constants_1.STRINGS.close }));
        constants_1.exportOptions.forEach(function (_a) {
            var label = _a.label, fileFormat = _a.fileFormat;
            buttons.push(React.createElement(button_1.Button, { type: "secondary", className: "download", key: "download-" + fileFormat, onClick: function () { return _this.download(fileFormat); }, title: label, disabled: Boolean(loading || error) }));
        });
        return React.createElement("div", { className: "button-bar" }, buttons);
    };
    RawDataModal.prototype.download = function (fileFormat) {
        var dataset = this.state.dataset;
        var _a = this.props, essence = _a.essence, timekeeper = _a.timekeeper;
        var dataCube = essence.dataCube;
        var options = tabular_options_1.default(essence);
        var filtersString = download_1.dateFromFilter(essence.getEffectiveFilter(timekeeper));
        download_1.download({ dataset: dataset, options: options }, fileFormat, download_1.makeFileName(dataCube.name, filtersString, "raw"));
    };
    RawDataModal.prototype.render = function () {
        var _a = this.props, essence = _a.essence, onClose = _a.onClose;
        var _b = this.state, dataset = _b.dataset, loading = _b.loading, error = _b.error, stage = _b.stage;
        var dataCube = essence.dataCube;
        var title = "" + general_1.makeTitle(constants_1.STRINGS.rawData);
        var scrollerLayout = {
            bodyWidth: general_1.arraySum(dataCube.attributes.map(getColumnWidth)),
            bodyHeight: (dataset ? dataset.data.length : 0) * ROW_HEIGHT,
            top: HEADER_HEIGHT,
            right: 0,
            bottom: 0,
            left: 0
        };
        return React.createElement(modal_1.Modal, { className: "raw-data-modal", title: title, onClose: onClose },
            React.createElement("div", { className: "content" },
                React.createElement("ul", { className: "filters" }, this.renderFilters()),
                React.createElement(scroller_1.Scroller, { ref: "table", layout: scrollerLayout, topGutter: this.renderHeader(), body: stage && this.renderRows(), onScroll: this.onScroll, onViewportUpdate: this.onScrollerViewportUpdate }),
                error ? React.createElement(query_error_1.QueryError, { error: error }) : null,
                loading ? React.createElement(loader_1.Loader, null) : null,
                this.renderButtons()));
    };
    return RawDataModal;
}(React.Component));
exports.RawDataModal = RawDataModal;
//# sourceMappingURL=raw-data-modal.js.map