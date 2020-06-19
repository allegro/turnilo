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
var plywood_1 = require("plywood");
var React = require("react");
var general_1 = require("../../../common/utils/general/general");
var dom_1 = require("../../utils/dom/dom");
var loader_1 = require("../loader/loader");
var query_error_1 = require("../query-error/query-error");
var range_handle_1 = require("../range-handle/range-handle");
require("./number-range-picker.scss");
exports.ANY_VALUE = null;
var NUB_SIZE = 16;
var GRANULARITY_IN_BAR = 300;
function addNubSize(value) {
    return value + NUB_SIZE;
}
function subtractNubSize(value) {
    return value && value > NUB_SIZE ? value - NUB_SIZE : 0;
}
function getNumberOfDigitsToShow(n) {
    var totalDigits = general_1.getNumberOfWholeDigits(n / GRANULARITY_IN_BAR);
    return totalDigits > 3 ? Math.min(totalDigits, 4) : 3;
}
function getAdjustedStartHalf(start) {
    return start + NUB_SIZE / 2;
}
var NumberRangePicker = (function (_super) {
    __extends(NumberRangePicker, _super);
    function NumberRangePicker(props) {
        var _this = _super.call(this, props) || this;
        _this.picker = React.createRef();
        _this.updateStart = function (absolutePosition) {
            var onRangeStartChange = _this.props.onRangeStartChange;
            var leftOffset = _this.state.leftOffset;
            var relativePosition = absolutePosition - leftOffset;
            var newValue = _this.relativePositionToValue(addNubSize(relativePosition), "start");
            onRangeStartChange(newValue);
        };
        _this.updateEnd = function (absolutePosition) {
            var onRangeEndChange = _this.props.onRangeEndChange;
            var leftOffset = _this.state.leftOffset;
            var relativePosition = absolutePosition - leftOffset;
            var newValue = _this.relativePositionToValue(relativePosition, "end");
            onRangeEndChange(newValue);
        };
        _this.state = {
            min: null,
            max: null,
            step: null,
            loading: false,
            error: null
        };
        return _this;
    }
    NumberRangePicker.prototype.fetchData = function (essence, timekeeper, dimension, rightBound) {
        var _this = this;
        var dataCube = essence.dataCube;
        var filterExpression = essence.getEffectiveFilter(timekeeper, { unfilterDimension: dimension }).toExpression(dataCube);
        var $main = plywood_1.$("main");
        var query = plywood_1.ply()
            .apply("main", $main.filter(filterExpression))
            .apply("Min", $main.min(plywood_1.$(dimension.name)))
            .apply("Max", $main.max(plywood_1.$(dimension.name)));
        this.setState({
            loading: true
        });
        dataCube.executor(query)
            .then(function (dataset) {
            if (!_this.mounted)
                return;
            var min = dataset.data[0]["Min"];
            var max = dataset.data[0]["Max"];
            var step = max && min && isFinite(max) && isFinite(min) ? (max - min) / rightBound : 1;
            _this.setState({
                min: min,
                max: max,
                loading: false,
                step: step !== 0 && isFinite(step) ? step : 1
            });
        }, function (error) {
            if (!_this.mounted)
                return;
            _this.setState({
                loading: false,
                error: error
            });
        });
    };
    NumberRangePicker.prototype.componentDidMount = function () {
        this.mounted = true;
        var node = this.picker.current;
        var rect = node.getBoundingClientRect();
        var _a = this.props, essence = _a.essence, timekeeper = _a.timekeeper, dimension = _a.dimension;
        var leftOffset = rect.left;
        var rightBound = rect.width;
        this.setState({ leftOffset: leftOffset, rightBound: rightBound });
        this.fetchData(essence, timekeeper, dimension, rightBound);
    };
    NumberRangePicker.prototype.componentWillUnmount = function () {
        this.mounted = false;
    };
    NumberRangePicker.prototype.relativePositionToValue = function (position, type) {
        var _a = this.state, step = _a.step, min = _a.min, max = _a.max, rightBound = _a.rightBound;
        if (position <= addNubSize(0) && type === "start")
            return exports.ANY_VALUE;
        if (position >= rightBound && type === "end")
            return exports.ANY_VALUE;
        var range = max - min !== 0 ? max - min : Math.abs(max);
        return general_1.toSignificantDigits(position * step, getNumberOfDigitsToShow(range));
    };
    NumberRangePicker.prototype.valueToRelativePosition = function (value) {
        var step = this.state.step;
        return value / step;
    };
    NumberRangePicker.prototype.onBarClick = function (positionStart, positionEnd, e) {
        var leftOffset = this.state.leftOffset;
        var clickPadding = 5;
        var absoluteX = dom_1.getXFromEvent(e);
        var relativeX = absoluteX - leftOffset;
        if (relativeX < NUB_SIZE / 2)
            return this.updateStart(leftOffset);
        var startNubPosition = addNubSize(positionStart) + clickPadding;
        var endNubPosition = subtractNubSize(positionEnd) + clickPadding;
        var isBeforeStart = relativeX < positionStart;
        var isAfterEnd = relativeX > positionEnd + NUB_SIZE;
        var inBetween = (relativeX < positionEnd) && relativeX > startNubPosition;
        if (isBeforeStart) {
            this.updateStart(absoluteX - NUB_SIZE);
        }
        else if (isAfterEnd) {
            this.updateEnd(absoluteX);
        }
        else if (inBetween) {
            var distanceFromEnd = endNubPosition - relativeX;
            var distanceFromStart = relativeX - startNubPosition;
            if (distanceFromEnd < distanceFromStart) {
                this.updateEnd(endNubPosition + leftOffset - distanceFromEnd);
            }
            else {
                this.updateStart(startNubPosition + leftOffset + distanceFromStart - NUB_SIZE);
            }
            return;
        }
    };
    NumberRangePicker.prototype.render = function () {
        var _a = this.props, start = _a.start, end = _a.end, exclude = _a.exclude;
        var _b = this.state, min = _b.min, max = _b.max, loading = _b.loading, error = _b.error, step = _b.step, rightBound = _b.rightBound, leftOffset = _b.leftOffset;
        var content = null;
        if (rightBound && step && isFinite(max) && isFinite(min)) {
            var relativeStart = start === exports.ANY_VALUE ? 0 : subtractNubSize(this.valueToRelativePosition(start));
            var relativeEnd = end === exports.ANY_VALUE ? rightBound : this.valueToRelativePosition(end);
            var adjustedRightBound = subtractNubSize(rightBound);
            var positionEnd = dom_1.clamp(relativeEnd, addNubSize(relativeStart), adjustedRightBound);
            var positionStart = start ? dom_1.clamp(relativeStart, 0, subtractNubSize(positionEnd)) : 0;
            var rangeBarSelected = { left: getAdjustedStartHalf(positionStart), width: positionEnd - positionStart };
            var absoluteRightBound = leftOffset + rightBound;
            content = React.createElement("div", { className: "range-slider", onMouseDown: this.onBarClick.bind(this, positionStart, positionEnd) },
                React.createElement("div", { className: "range-bar full" }),
                React.createElement("div", { className: "range-bar selected", style: rangeBarSelected }),
                React.createElement(range_handle_1.RangeHandle, { positionLeft: positionStart, onChange: this.updateStart, isAny: start === exports.ANY_VALUE, isBeyondMin: start !== exports.ANY_VALUE && start < min, leftBound: leftOffset, rightBound: leftOffset + subtractNubSize(positionEnd), offset: leftOffset }),
                React.createElement(range_handle_1.RangeHandle, { positionLeft: positionEnd, onChange: this.updateEnd, isAny: end === exports.ANY_VALUE, isBeyondMax: end !== exports.ANY_VALUE && max < end, leftBound: leftOffset + addNubSize(positionStart), rightBound: absoluteRightBound, offset: leftOffset }));
        }
        return React.createElement("div", { className: dom_1.classNames("number-range-picker", { inverted: exclude }), ref: this.picker },
            content,
            loading && React.createElement(loader_1.Loader, null),
            error && React.createElement(query_error_1.QueryError, { error: error }));
    };
    return NumberRangePicker;
}(React.Component));
exports.NumberRangePicker = NumberRangePicker;
//# sourceMappingURL=number-range-picker.js.map