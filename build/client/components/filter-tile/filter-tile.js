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
var ReactDOM = require("react-dom");
var drag_position_1 = require("../../../common/models/drag-position/drag-position");
var filter_clause_1 = require("../../../common/models/filter-clause/filter-clause");
var stage_1 = require("../../../common/models/stage/stage");
var formatter_1 = require("../../../common/utils/formatter/formatter");
var promise_1 = require("../../../common/utils/promise/promise");
var constants_1 = require("../../config/constants");
var dom_1 = require("../../utils/dom/dom");
var drag_manager_1 = require("../../utils/drag-manager/drag-manager");
var pill_tile_1 = require("../../utils/pill-tile/pill-tile");
var add_tile_1 = require("../add-tile/add-tile");
var bubble_menu_1 = require("../bubble-menu/bubble-menu");
var fancy_drag_indicator_1 = require("../drag-indicator/fancy-drag-indicator");
var filter_menu_1 = require("../filter-menu/filter-menu");
var svg_icon_1 = require("../svg-icon/svg-icon");
require("./filter-tile.scss");
var FILTER_CLASS_NAME = "filter";
var ANIMATION_DURATION = 400;
function formatLabelDummy(dimension) {
    return dimension.title;
}
var FilterTile = (function (_super) {
    __extends(FilterTile, _super);
    function FilterTile(props) {
        var _this = _super.call(this, props) || this;
        _this.items = React.createRef();
        _this.overflow = React.createRef();
        _this.closeMenu = function () {
            var _a = _this.state, menuOpenOn = _a.menuOpenOn, possibleDimension = _a.possibleDimension;
            if (!menuOpenOn)
                return;
            var newState = {
                menuOpenOn: null,
                menuDimension: null,
                menuInside: null,
                possibleDimension: null,
                possiblePosition: null
            };
            if (possibleDimension) {
                newState.overflowMenuOpenOn = null;
            }
            _this.setState(newState);
        };
        _this.closeOverflowMenu = function () {
            var overflowMenuOpenOn = _this.state.overflowMenuOpenOn;
            if (!overflowMenuOpenOn)
                return;
            _this.setState({
                overflowMenuOpenOn: null
            });
        };
        _this.dragEnter = function (e) {
            if (!_this.canDrop())
                return;
            e.preventDefault();
            var dragPosition = _this.calculateDragPosition(e);
            if (dragPosition.equals(_this.state.dragPosition))
                return;
            _this.setState({ dragPosition: dragPosition });
        };
        _this.dragOver = function (e) {
            if (!_this.canDrop())
                return;
            e.preventDefault();
            var dragPosition = _this.calculateDragPosition(e);
            if (dragPosition.equals(_this.state.dragPosition))
                return;
            _this.setState({ dragPosition: dragPosition });
        };
        _this.dragLeave = function () {
            _this.setState({ dragPosition: null });
        };
        _this.drop = function (e) {
            if (!_this.canDrop())
                return;
            e.preventDefault();
            _this.setState({ dragPosition: null });
            var dragPosition = _this.calculateDragPosition(e);
            if (drag_manager_1.DragManager.isDraggingFilter()) {
                _this.dropFilter(dragPosition);
                return;
            }
            _this.dropDimension(dragPosition);
        };
        _this.appendFilter = function (dimension) {
            _this.addDummy(dimension, new drag_position_1.DragPosition({ insert: _this.props.essence.filter.length() }));
        };
        _this.overflowButtonClick = function () {
            _this.openOverflowMenu(_this.overflowButtonTarget());
        };
        _this.overflowMenuId = dom_1.uniqueId("overflow-menu-");
        _this.state = {
            menuOpenOn: null,
            menuDimension: null,
            menuInside: null,
            overflowMenuOpenOn: null,
            dragPosition: null,
            possibleDimension: null,
            possiblePosition: null,
            maxItems: 20
        };
        return _this;
    }
    FilterTile.prototype.componentWillReceiveProps = function (nextProps) {
        var menuStage = nextProps.menuStage;
        if (menuStage) {
            var newMaxItems = pill_tile_1.getMaxItems(menuStage.width, this.getItemBlanks().length);
            if (newMaxItems !== this.state.maxItems) {
                this.setState({
                    menuOpenOn: null,
                    menuDimension: null,
                    menuInside: null,
                    possibleDimension: null,
                    possiblePosition: null,
                    overflowMenuOpenOn: null,
                    maxItems: newMaxItems
                });
            }
        }
    };
    FilterTile.prototype.componentDidUpdate = function () {
        var _a = this.state, possibleDimension = _a.possibleDimension, overflowMenuOpenOn = _a.overflowMenuOpenOn;
        if (possibleDimension) {
            this.dummyDeferred.resolve(null);
        }
        if (overflowMenuOpenOn) {
            this.overflowMenuDeferred.resolve(null);
        }
    };
    FilterTile.prototype.overflowButtonTarget = function () {
        return this.overflow.current;
    };
    FilterTile.prototype.getOverflowMenu = function () {
        return document.getElementById(this.overflowMenuId);
    };
    FilterTile.prototype.clickDimension = function (dimension, e) {
        var target = dom_1.findParentWithClass(e.target, FILTER_CLASS_NAME);
        this.toggleMenu(dimension, target);
        e.stopPropagation();
    };
    FilterTile.prototype.openMenuOnDimension = function (dimension) {
        var _this = this;
        var targetRef = this.refs[dimension.name];
        if (targetRef) {
            var target = ReactDOM.findDOMNode(targetRef);
            if (!target)
                return;
            this.openMenu(dimension, target);
        }
        else {
            var overflowButtonTarget = this.overflowButtonTarget();
            if (overflowButtonTarget) {
                this.openOverflowMenu(overflowButtonTarget).then(function () {
                    var target = ReactDOM.findDOMNode(_this.refs[dimension.name]);
                    if (!target)
                        return;
                    _this.openMenu(dimension, target);
                });
            }
        }
    };
    FilterTile.prototype.toggleMenu = function (dimension, target) {
        var menuOpenOn = this.state.menuOpenOn;
        if (menuOpenOn === target) {
            this.closeMenu();
            return;
        }
        this.openMenu(dimension, target);
    };
    FilterTile.prototype.openMenu = function (dimension, target) {
        var overflowMenu = this.getOverflowMenu();
        var menuInside = overflowMenu && dom_1.isInside(target, overflowMenu) ? overflowMenu : null;
        this.setState({
            menuOpenOn: target,
            menuDimension: dimension,
            menuInside: menuInside
        });
    };
    FilterTile.prototype.openOverflowMenu = function (target) {
        if (!target)
            return Promise.resolve(null);
        var overflowMenuOpenOn = this.state.overflowMenuOpenOn;
        if (overflowMenuOpenOn === target) {
            this.closeOverflowMenu();
            return Promise.resolve(null);
        }
        this.overflowMenuDeferred = new promise_1.Deferred();
        this.setState({ overflowMenuOpenOn: target });
        return this.overflowMenuDeferred.promise;
    };
    FilterTile.prototype.removeFilter = function (itemBlank, e) {
        var _a = this.props, essence = _a.essence, clicker = _a.clicker;
        if (itemBlank.clause) {
            clicker.changeFilter(essence.filter.removeClause(itemBlank.clause.reference));
        }
        this.closeMenu();
        this.closeOverflowMenu();
        e.stopPropagation();
    };
    FilterTile.prototype.dragStart = function (dimension, clause, e) {
        var dataTransfer = e.dataTransfer;
        dataTransfer.effectAllowed = "all";
        dom_1.setDragData(dataTransfer, "text/plain", dimension.title);
        drag_manager_1.DragManager.setDragFilter(clause);
        dom_1.setDragGhost(dataTransfer, dimension.title);
        this.closeMenu();
        this.closeOverflowMenu();
    };
    FilterTile.prototype.calculateDragPosition = function (e) {
        var essence = this.props.essence;
        var numItems = essence.filter.length();
        var rect = this.items.current.getBoundingClientRect();
        var offset = dom_1.getXFromEvent(e) - rect.left;
        return drag_position_1.DragPosition.calculateFromOffset(offset, numItems, constants_1.CORE_ITEM_WIDTH, constants_1.CORE_ITEM_GAP);
    };
    FilterTile.prototype.canDrop = function () {
        var filter = this.props.essence.filter;
        var dimension = drag_manager_1.DragManager.draggingDimension();
        if (dimension)
            return !filter.getClauseForDimension(dimension);
        if (drag_manager_1.DragManager.isDraggingSplit()) {
            return !filter.clauseForReference(drag_manager_1.DragManager.draggingSplit().reference);
        }
        return drag_manager_1.DragManager.isDraggingFilter();
    };
    FilterTile.prototype.draggingDimension = function () {
        var dataCube = this.props.essence.dataCube;
        if (drag_manager_1.DragManager.isDraggingSplit()) {
            return dataCube.getDimension(drag_manager_1.DragManager.draggingSplit().reference);
        }
        return drag_manager_1.DragManager.draggingDimension();
    };
    FilterTile.prototype.dropDimension = function (dragPosition) {
        var _a = this.props.essence, filter = _a.filter, dataCube = _a.dataCube;
        var dimension = this.draggingDimension();
        var tryingToReplaceTime = false;
        if (dragPosition.replace !== null) {
            var targetClause = filter.clauses.get(dragPosition.replace);
            tryingToReplaceTime = targetClause && targetClause.reference === dataCube.getTimeDimension().name;
        }
        if (dragPosition && !tryingToReplaceTime) {
            this.addDummy(dimension, dragPosition);
        }
    };
    FilterTile.prototype.dropFilter = function (dragPosition) {
        var _a = this.props, clicker = _a.clicker, filter = _a.essence.filter;
        var clause = drag_manager_1.DragManager.draggingFilter();
        var newFilter = dragPosition.isReplace()
            ? filter.replaceByIndex(dragPosition.replace, clause)
            : filter.insertByIndex(dragPosition.insert, clause);
        !filter.equals(newFilter) && clicker.changeFilter(newFilter);
    };
    FilterTile.prototype.addDummy = function (dimension, possiblePosition) {
        var _this = this;
        this.dummyDeferred = new promise_1.Deferred();
        this.setState({
            possibleDimension: dimension,
            possiblePosition: possiblePosition
        });
        this.dummyDeferred.promise.then(function () {
            _this.openMenuOnDimension(dimension);
        });
    };
    FilterTile.prototype.filterMenuRequest = function (dimension) {
        var filter = this.props.essence.filter;
        if (filter.filteredOn(dimension.name)) {
            this.openMenuOnDimension(dimension);
        }
        else {
            this.addDummy(dimension, new drag_position_1.DragPosition({ insert: filter.length() }));
        }
    };
    FilterTile.prototype.renderMenu = function () {
        var _a = this.props, essence = _a.essence, timekeeper = _a.timekeeper, clicker = _a.clicker, menuStage = _a.menuStage;
        var _b = this.state, menuOpenOn = _b.menuOpenOn, menuDimension = _b.menuDimension, menuInside = _b.menuInside, maxItems = _b.maxItems, overflowMenuOpenOn = _b.overflowMenuOpenOn;
        var possiblePosition = this.state.possiblePosition;
        if (!menuDimension)
            return null;
        if (possiblePosition && possiblePosition.replace === maxItems) {
            possiblePosition = new drag_position_1.DragPosition({ insert: possiblePosition.replace });
        }
        return React.createElement(filter_menu_1.FilterMenu, { clicker: clicker, essence: essence, timekeeper: timekeeper, containerStage: overflowMenuOpenOn ? null : menuStage, openOn: menuOpenOn, dimension: menuDimension, changePosition: possiblePosition, onClose: this.closeMenu, inside: menuInside });
    };
    FilterTile.prototype.renderOverflowMenu = function (overflowItemBlanks) {
        var _this = this;
        var overflowMenuOpenOn = this.state.overflowMenuOpenOn;
        if (!overflowMenuOpenOn)
            return null;
        var segmentHeight = 29 + constants_1.CORE_ITEM_GAP;
        var filterItems = overflowItemBlanks.map(function (itemBlank, index) {
            var style = dom_1.transformStyle(0, constants_1.CORE_ITEM_GAP + index * segmentHeight);
            return _this.renderItemBlank(itemBlank, style);
        });
        var stageHeight = constants_1.CORE_ITEM_GAP + filterItems.length * segmentHeight;
        return React.createElement(bubble_menu_1.BubbleMenu, { className: "overflow-menu", id: this.overflowMenuId, direction: "down", stage: stage_1.Stage.fromSize(208, stageHeight), fixedSize: true, openOn: overflowMenuOpenOn, onClose: this.closeOverflowMenu }, filterItems);
    };
    FilterTile.prototype.renderOverflow = function (overflowItemBlanks, itemX) {
        var style = dom_1.transformStyle(itemX, 0);
        return React.createElement("div", { className: "overflow dimension", ref: this.overflow, key: "overflow", style: style, onClick: this.overflowButtonClick },
            React.createElement("div", { className: "count" }, "+" + overflowItemBlanks.length),
            this.renderOverflowMenu(overflowItemBlanks));
    };
    FilterTile.prototype.renderRemoveButton = function (itemBlank) {
        var essence = this.props.essence;
        var dataCube = essence.dataCube;
        if (itemBlank.dimension.expression.equals(dataCube.timeAttribute))
            return null;
        return React.createElement("div", { className: "remove", onClick: this.removeFilter.bind(this, itemBlank) },
            React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/x.svg") }));
    };
    FilterTile.prototype.renderTimeShiftLabel = function (dimension) {
        var essence = this.props.essence;
        if (!dimension.expression.equals(essence.dataCube.timeAttribute))
            return null;
        if (!essence.hasComparison())
            return null;
        return "(Shift: " + essence.timeShift.getDescription(true) + ")";
    };
    FilterTile.prototype.renderItemLabel = function (dimension, clause, timezone) {
        var _a = formatter_1.getFormattedClause(dimension, clause, timezone), title = _a.title, values = _a.values;
        var timeShift = this.renderTimeShiftLabel(dimension);
        return React.createElement("div", { className: "reading" },
            title ? React.createElement("span", { className: "dimension-title" }, title) : null,
            React.createElement("span", { className: "values" },
                values,
                " ",
                timeShift));
    };
    FilterTile.prototype.renderItemBlank = function (itemBlank, style) {
        var _a = this.props, timezone = _a.essence.timezone, clicker = _a.clicker;
        var menuDimension = this.state.menuDimension;
        var dimension = itemBlank.dimension, clause = itemBlank.clause, source = itemBlank.source;
        var dimensionName = dimension.name;
        var selected = dimension === menuDimension;
        var excluded = clause && !filter_clause_1.isTimeFilter(clause) && clause.not;
        var className = dom_1.classNames(FILTER_CLASS_NAME, "dimension", source, { selected: selected, excluded: excluded, included: !excluded });
        if (clause) {
            return React.createElement("div", { className: className, key: dimensionName, ref: dimensionName, draggable: true, onClick: this.clickDimension.bind(this, dimension), onDragStart: this.dragStart.bind(this, dimension, clause), style: style },
                this.renderItemLabel(dimension, clause, timezone),
                this.renderRemoveButton(itemBlank));
        }
        else {
            return React.createElement("div", { className: className, key: dimensionName, ref: dimensionName, style: style },
                React.createElement("div", { className: "reading" }, formatLabelDummy(dimension)),
                this.renderRemoveButton(itemBlank));
        }
    };
    FilterTile.prototype.getItemBlanks = function () {
        var essence = this.props.essence;
        var _a = this.state, possibleDimension = _a.possibleDimension, maxItems = _a.maxItems;
        var possiblePosition = this.state.possiblePosition;
        var dataCube = essence.dataCube, filter = essence.filter;
        var itemBlanks = filter.clauses.toArray()
            .map(function (clause) {
            var dimension = dataCube.getDimension(clause.reference);
            if (!dimension)
                return null;
            return {
                dimension: dimension,
                source: "from-filter",
                clause: clause
            };
        })
            .filter(Boolean);
        if (possibleDimension && possiblePosition) {
            var dummyBlank = {
                dimension: possibleDimension,
                source: "from-drag"
            };
            if (possiblePosition.replace === maxItems) {
                possiblePosition = new drag_position_1.DragPosition({ insert: possiblePosition.replace });
            }
            if (possiblePosition.isInsert()) {
                itemBlanks.splice(possiblePosition.insert, 0, dummyBlank);
            }
            else {
                itemBlanks[possiblePosition.replace] = dummyBlank;
            }
        }
        return itemBlanks;
    };
    FilterTile.prototype.renderAddButton = function () {
        var _a = this.props, _b = _a.essence, dataCube = _b.dataCube, filter = _b.filter, menuStage = _a.menuStage;
        var tiles = dataCube.dimensions
            .filterDimensions(function (dimension) { return !filter.getClauseForDimension(dimension); })
            .map(function (dimension) {
            return {
                key: dimension.name,
                label: dimension.title,
                value: dimension
            };
        });
        return React.createElement(add_tile_1.AddTile, { containerStage: menuStage, onSelect: this.appendFilter, tiles: tiles });
    };
    FilterTile.prototype.render = function () {
        var _this = this;
        var _a = this.state, dragPosition = _a.dragPosition, maxItems = _a.maxItems;
        var itemBlanks = this.getItemBlanks();
        var filterItems = itemBlanks.slice(0, maxItems).map(function (item, index) {
            var style = dom_1.transformStyle(index * pill_tile_1.SECTION_WIDTH, 0);
            return _this.renderItemBlank(item, style);
        });
        var overflow = itemBlanks.slice(maxItems);
        if (overflow.length > 0) {
            var overFlowStart = filterItems.length * pill_tile_1.SECTION_WIDTH;
            filterItems.push(this.renderOverflow(overflow, overFlowStart));
        }
        return React.createElement("div", { className: "filter-tile", onDragEnter: this.dragEnter },
            React.createElement("div", { className: "title" }, constants_1.STRINGS.filter),
            React.createElement("div", { className: "items", ref: this.items }, filterItems),
            this.renderAddButton(),
            dragPosition ? React.createElement(fancy_drag_indicator_1.FancyDragIndicator, { dragPosition: dragPosition }) : null,
            dragPosition ? React.createElement("div", { className: "drag-mask", onDragOver: this.dragOver, onDragLeave: this.dragLeave, onDragExit: this.dragLeave, onDrop: this.drop }) : null,
            this.renderMenu());
    };
    return FilterTile;
}(React.Component));
exports.FilterTile = FilterTile;
//# sourceMappingURL=filter-tile.js.map