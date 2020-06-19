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
var React = require("react");
var granularity_1 = require("../../../common/models/granularity/granularity");
var sort_on_1 = require("../../../common/models/sort-on/sort-on");
var split_1 = require("../../../common/models/split/split");
var stage_1 = require("../../../common/models/stage/stage");
var constants_1 = require("../../config/constants");
var dom_1 = require("../../utils/dom/dom");
var bubble_menu_1 = require("../bubble-menu/bubble-menu");
var button_1 = require("../button/button");
var granularity_picker_1 = require("./granularity-picker");
var limit_dropdown_1 = require("./limit-dropdown");
var sort_dropdown_1 = require("./sort-dropdown");
require("./split-menu.scss");
var SplitMenu = (function (_super) {
    __extends(SplitMenu, _super);
    function SplitMenu() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {};
        _this.globalKeyDownListener = function (e) { return dom_1.enterKey(e) && _this.onOkClick(); };
        _this.saveGranularity = function (granularity) { return _this.setState({ granularity: granularity }); };
        _this.saveSort = function (sort) { return _this.setState({ sort: sort }); };
        _this.saveLimit = function (limit) { return _this.setState({ limit: limit }); };
        _this.onCancelClick = function () { return _this.props.onClose(); };
        _this.onOkClick = function () {
            if (!_this.validate())
                return;
            var _a = _this.props, split = _a.split, saveSplit = _a.saveSplit, onClose = _a.onClose;
            var newSplit = _this.constructSplitCombine();
            saveSplit(split, newSplit);
            onClose();
        };
        return _this;
    }
    SplitMenu.prototype.componentWillMount = function () {
        var split = this.props.split;
        var bucket = split.bucket, reference = split.reference, sort = split.sort, limit = split.limit;
        this.setState({
            reference: reference,
            sort: sort,
            limit: limit,
            granularity: bucket && granularity_1.granularityToString(bucket)
        });
    };
    SplitMenu.prototype.componentDidMount = function () {
        window.addEventListener("keydown", this.globalKeyDownListener);
    };
    SplitMenu.prototype.componentWillUnmount = function () {
        window.removeEventListener("keydown", this.globalKeyDownListener);
    };
    SplitMenu.prototype.constructGranularity = function () {
        var kind = this.props.dimension.kind;
        var granularity = this.state.granularity;
        if (kind === "time") {
            return chronoshift_1.Duration.fromJS(granularity);
        }
        if (kind === "number") {
            return parseInt(granularity, 10);
        }
        return null;
    };
    SplitMenu.prototype.constructSplitCombine = function () {
        var type = this.props.split.type;
        var _a = this.state, limit = _a.limit, sort = _a.sort, reference = _a.reference;
        var bucket = this.constructGranularity();
        return new split_1.Split({ type: type, reference: reference, limit: limit, sort: sort, bucket: bucket });
    };
    SplitMenu.prototype.validate = function () {
        var _a = this.props, kind = _a.dimension.kind, originalSplit = _a.split;
        if (!granularity_1.isGranularityValid(kind, this.state.granularity)) {
            return false;
        }
        var newSplit = this.constructSplitCombine();
        return !originalSplit.equals(newSplit);
    };
    SplitMenu.prototype.renderSortDropdown = function () {
        var _a = this.props, essence = _a.essence, dimension = _a.dimension;
        var sort = this.state.sort;
        var seriesSortOns = essence.seriesSortOns(true).toArray();
        var options = [new sort_on_1.DimensionSortOn(dimension)].concat(seriesSortOns);
        var selected = sort_on_1.SortOn.fromSort(sort, essence);
        return React.createElement(sort_dropdown_1.SortDropdown, { direction: sort.direction, selected: selected, options: options, onChange: this.saveSort });
    };
    SplitMenu.prototype.render = function () {
        var _a = this.props, containerStage = _a.containerStage, openOn = _a.openOn, dimension = _a.dimension, onClose = _a.onClose;
        var _b = this.state, granularity = _b.granularity, limit = _b.limit;
        if (!dimension)
            return null;
        return React.createElement(bubble_menu_1.BubbleMenu, { className: "split-menu", direction: "down", containerStage: containerStage, stage: stage_1.Stage.fromSize(250, 240), openOn: openOn, onClose: onClose },
            React.createElement(granularity_picker_1.GranularityPicker, { dimension: dimension, granularityChange: this.saveGranularity, granularity: granularity }),
            this.renderSortDropdown(),
            React.createElement(limit_dropdown_1.LimitDropdown, { onLimitSelect: this.saveLimit, limit: limit, includeNone: dimension.isContinuous() }),
            React.createElement("div", { className: "button-bar" },
                React.createElement(button_1.Button, { className: "ok", type: "primary", disabled: !this.validate(), onClick: this.onOkClick, title: constants_1.STRINGS.ok }),
                React.createElement(button_1.Button, { type: "secondary", onClick: this.onCancelClick, title: constants_1.STRINGS.cancel })));
    };
    return SplitMenu;
}(React.Component));
exports.SplitMenu = SplitMenu;
//# sourceMappingURL=split-menu.js.map