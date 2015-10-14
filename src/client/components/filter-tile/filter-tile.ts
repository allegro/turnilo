'use strict';
require('./filter-tile.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Timezone, Duration, hour, day, week } from 'chronoshift';
import { $, Expression, ChainExpression, InAction, Executor, Dataset } from 'plywood';
import { CORE_ITEM_WIDTH, CORE_ITEM_GAP } from '../../config/constants';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../../common/models/index';
import { calculateDragPosition, DragPosition } from '../../../common/utils/general/general';
import { formatTimeRange } from '../../utils/date/date';
import { findParentWithClass, dataTransferTypesGet, setDragGhost, transformStyle } from '../../utils/dom/dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { FancyDragIndicator } from '../fancy-drag-indicator/fancy-drag-indicator';
import { FilterMenu } from '../filter-menu/filter-menu';

const FILTER_CLASS_NAME = 'filter';

export interface ItemBlank {
  dimension: Dimension;
  source: string;
  clause?: ChainExpression;
}

export interface FilterTileProps {
  clicker: Clicker;
  essence: Essence;
  menuStage: Stage;

  ref?: any;
}

export interface FilterTileState {
  FilterMenuAsync?: typeof FilterMenu;
  menuOpenOn?: Element;
  menuDimension?: Dimension;
  dragOver?: boolean;
  dragInsertPosition?: number;
  dragReplacePosition?: number;
  possibleDimension?: Dimension;
  possibleInsertPosition?: number;
  possibleReplacePosition?: number;
}

export class FilterTile extends React.Component<FilterTileProps, FilterTileState> {
  private dragCounter: number;

  constructor() {
    super();
    this.state = {
      FilterMenuAsync: null,
      menuOpenOn: null,
      menuDimension: null,
      dragOver: false,
      dragInsertPosition: null,
      dragReplacePosition: null,
      possibleDimension: null,
      possibleInsertPosition: null,
      possibleReplacePosition: null
    };
  }

  componentDidMount() {
    require.ensure(['../filter-menu/filter-menu'], (require) => {
      this.setState({
        FilterMenuAsync: require('../filter-menu/filter-menu').FilterMenu
      });
    }, 'filter-menu');
  }

  clickDimension(dimension: Dimension, e: MouseEvent) {
    var target = findParentWithClass(<Element>e.target, FILTER_CLASS_NAME);
    this.openMenu(dimension, target);
  }

  dummyMount(dimension: Dimension, dummy: React.Component<any, any>) {
    var { menuOpenOn } = this.state;
    if (menuOpenOn || !dummy) return;
    var target = ReactDOM.findDOMNode(dummy);
    this.openMenu(dimension, target);
  }

  openMenu(dimension: Dimension, target: Element) {
    var { menuOpenOn } = this.state;
    if (menuOpenOn === target) {
      this.closeMenu();
      return;
    }
    this.setState({
      menuOpenOn: target,
      menuDimension: dimension
    });
  }

  closeMenu() {
    if (!this.state.menuOpenOn) return;
    this.setState({
      menuOpenOn: null,
      menuDimension: null,
      possibleDimension: null,
      possibleInsertPosition: null,
      possibleReplacePosition: null
    });
  }

  removeFilter(itemBlank: ItemBlank, e: MouseEvent) {
    var { essence, clicker } = this.props;
    if (itemBlank.clause) {
      if (itemBlank.source === 'from-highlight') {
        clicker.dropHighlight();
      } else {
        clicker.changeFilter(essence.filter.remove(itemBlank.clause.expression));
      }
    }
    this.closeMenu();
    e.stopPropagation();
  }

  dragStart(dimension: Dimension, clause: ChainExpression, e: DragEvent) {
    var { essence } = this.props;

    var newUrl = essence.getURL(); // .changeSplit(SplitCombine.fromExpression(dimension.expression))

    var dataTransfer = e.dataTransfer;
    dataTransfer.effectAllowed = 'all';
    dataTransfer.setData("text/url-list", newUrl);
    dataTransfer.setData("text/plain", newUrl);
    dataTransfer.setData("dimension/" + dimension.name, JSON.stringify(dimension));

    setDragGhost(dataTransfer, dimension.title);
  }

  calculateDragPosition(e: DragEvent): DragPosition {
    var { essence } = this.props;
    var numItems = essence.filter.length();
    var rect = ReactDOM.findDOMNode(this.refs['items']).getBoundingClientRect();
    var x = e.clientX || e.pageX;
    var offset = x - rect.left;
    return calculateDragPosition(offset, numItems, CORE_ITEM_WIDTH, CORE_ITEM_GAP);
  }

  canDrop(e: DragEvent): boolean {
    return Boolean(dataTransferTypesGet(e.dataTransfer.types, "dimension"));
  }

  dragOver(e: DragEvent) {
    if (!this.canDrop(e)) return;
    e.dataTransfer.dropEffect = 'move';
    e.preventDefault();
    this.setState(this.calculateDragPosition(e));
  }

  dragEnter(e: DragEvent) {
    if (!this.canDrop(e)) return;
    var { dragOver } = this.state;
    if (!dragOver) {
      this.dragCounter = 0;
      var newState: FilterTileState = this.calculateDragPosition(e);
      newState.dragOver = true;
      this.setState(newState);
    } else {
      this.dragCounter++;
    }
  }

  dragLeave(e: DragEvent) {
    if (!this.canDrop(e)) return;
    var { dragOver } = this.state;
    if (!dragOver) return;
    if (this.dragCounter === 0) {
      this.setState({
        dragOver: false,
        dragInsertPosition: null,
        dragReplacePosition: null
      });
    } else {
      this.dragCounter--;
    }
  }

  drop(e: DragEvent) {
    if (!this.canDrop(e)) return;
    e.preventDefault();
    var { clicker, essence } = this.props;
    var { filter, dataSource } = essence;

    var newState: FilterTileState = {
      dragOver: false,
      dragInsertPosition: null,
      dragReplacePosition: null
    };

    var dimensionName = dataTransferTypesGet(e.dataTransfer.types, "dimension");
    if (dimensionName) {
      var dimension = dataSource.getDimension(dimensionName);
      if (dimension) {
        var { dragReplacePosition, dragInsertPosition } = this.calculateDragPosition(e);

        var tryingToReplaceTime = false;
        if (dragReplacePosition !== null) {
          var targetClause = filter.clauses.get(dragReplacePosition);
          tryingToReplaceTime = targetClause && targetClause.expression.equals(dataSource.timeAttribute);
        }

        var existingClause = filter.clauseForExpression(dimension.expression);
        if (existingClause) {
          if (dragReplacePosition !== null) {
            clicker.changeFilter(filter.replaceByIndex(dragReplacePosition, existingClause));
          } else if (dragInsertPosition !== null) {
            clicker.changeFilter(filter.insertByIndex(dragInsertPosition, existingClause));
          }

        } else {
          if ((dragInsertPosition !== null || dragReplacePosition !== null) && !tryingToReplaceTime) {
            newState.possibleDimension = dimension;
            newState.possibleInsertPosition = dragInsertPosition;
            newState.possibleReplacePosition = dragReplacePosition;
          }

        }
      }
    }

    this.dragCounter = 0;
    this.setState(newState);
  }

  // This will be called externally
  filterMenuRequest(dimension: Dimension) {
    var { filter } = this.props.essence;
    if (filter.filteredOn(dimension.expression)) {
      var targetRef = this.refs[dimension.name];
      if (!targetRef) return;
      var target = ReactDOM.findDOMNode(targetRef);
      if (!target) return;
      this.openMenu(dimension, target);
    } else {
      this.setState({
        possibleDimension: dimension,
        possibleInsertPosition: filter.length(),
        possibleReplacePosition: null
      });
    }
  }

  formatLabel(dimension: Dimension, clause: ChainExpression, timezone: Timezone): string {
    var label = dimension.title;

    switch (dimension.type) {
      case 'STRING':
      case 'BOOLEAN':
        var inAction = clause.actions[0];
        if (inAction instanceof InAction) {
          var setLiteral = inAction.getLiteralValue();
          if (!setLiteral) return '?';
          var setElements = setLiteral.elements;
          label += setElements.length > 1 ? ` (${setElements.length})` : `: ${setElements[0]}`;
        } else {
          label += ' : [not in]';
        }
        break;

      case 'TIME':
        var inAction = clause.actions[0];
        if (inAction instanceof InAction) {
          var timeRangeLiteral = inAction.getLiteralValue();
          if (!timeRangeLiteral) return '?';
          label = formatTimeRange(timeRangeLiteral, timezone, false);
        } else {
          label += ' : [not in]';
        }
        break;

      default:
        throw new Error('unknown type ' + dimension.type);
    }

    return label;
  }

  formatLabelDummy(dimension: Dimension): string {
    return dimension.title;
  }

  renderMenu(): React.ReactElement<any> {
    var { essence, clicker, menuStage } = this.props;
    var { FilterMenuAsync, menuOpenOn, menuDimension, possibleInsertPosition, possibleReplacePosition } = this.state;
    if (!FilterMenuAsync || !menuDimension) return null;
    var onClose = this.closeMenu.bind(this);

    return JSX(`
      <FilterMenuAsync
        clicker={clicker}
        essence={essence}
        direction="down"
        containerStage={menuStage}
        openOn={menuOpenOn}
        dimension={menuDimension}
        insertPosition={possibleInsertPosition}
        replacePosition={possibleReplacePosition}
        onClose={onClose}
      />
    `);
  }

  renderRemoveButton(itemBlank: ItemBlank) {
    var { essence } = this.props;
    var dataSource = essence.dataSource;
    if (itemBlank.dimension.expression.equals(dataSource.timeAttribute)) return null;
    return JSX(`
      <div className="remove" onClick={this.removeFilter.bind(this, itemBlank)}>
        <SvgIcon svg={require('../../icons/x.svg')}/>
      </div>
    `);
  }

  render() {
    var { essence, clicker } = this.props;
    var {
      menuDimension, dragOver, dragInsertPosition, dragReplacePosition,
      possibleDimension, possibleInsertPosition, possibleReplacePosition
    } = this.state;
    var { dataSource, filter, highlight, timezone } = essence;

    const sectionWidth = CORE_ITEM_WIDTH + CORE_ITEM_GAP;

    var itemBlanks = filter.clauses.toArray()
      .map((clause): ItemBlank => {
        var dimension = dataSource.getDimensionByExpression(clause.expression);
        if (!dimension) return null;
        return {
          dimension,
          source: 'from-filter',
          clause
        };
      })
      .filter(Boolean);

    if (highlight) {
      highlight.delta.clauses.forEach((clause) => {
        var added = false;
        itemBlanks = itemBlanks.map((blank) => {
          if (clause.expression.equals(blank.clause.expression)) {
            added = true;
            return {
              dimension: blank.dimension,
              source: 'from-highlight',
              clause
            };
          } else {
            return blank;
          }
        });
        if (!added) {
          var dimension = dataSource.getDimensionByExpression(clause.expression);
          if (dimension) {
            itemBlanks.push({
              dimension,
              source: 'from-highlight',
              clause
            });
          }
        }
      });
    }

    if (possibleDimension) {
      var dummyBlank: ItemBlank = {
        dimension: possibleDimension,
        source: 'from-drag'
      };
      if (possibleInsertPosition !== null) {
        itemBlanks.splice(possibleInsertPosition, 0, dummyBlank);
      }
      if (possibleReplacePosition !== null) {
        itemBlanks[possibleReplacePosition] = dummyBlank;
      }
    }

    var itemX = 0;
    var filterItems = itemBlanks.map((itemBlank) => {
      var { dimension, clause, source } = itemBlank;
      var dimensionName = dimension.name;

      var style = transformStyle(itemX, 0);
      itemX += sectionWidth;

      var classNames = [FILTER_CLASS_NAME, 'type-' + dimension.className, source];
      if (dimension === menuDimension) classNames.push('selected');

      var className = classNames.join(' ');

      if (source === 'from-highlight') {
        return JSX(`
          <div
            className={className}
            key={dimensionName}
            ref={dimensionName}
            onClick={clicker.acceptHighlight.bind(clicker)}
            style={style}
          >
            <div className="reading">{this.formatLabel(dimension, clause, timezone)}</div>
            {this.renderRemoveButton(itemBlank)}
          </div>
        `);
      }

      if (clause) {
        return JSX(`
          <div
            className={className}
            key={dimensionName}
            ref={dimensionName}
            draggable="true"
            onClick={this.clickDimension.bind(this, dimension)}
            onDragStart={this.dragStart.bind(this, dimension, clause)}
            style={style}
          >
            <div className="reading">{this.formatLabel(dimension, clause, timezone)}</div>
            {this.renderRemoveButton(itemBlank)}
          </div>
        `);
      } else {
        return JSX(`
          <div
            className={className}
            key={dimensionName}
            ref={this.dummyMount.bind(this, dimension)}
            style={style}
          >
            <div className="reading">{this.formatLabelDummy(dimension)}</div>
            {this.renderRemoveButton(itemBlank)}
          </div>
        `);
      }
    });

    var fancyDragIndicator: React.ReactElement<any> = null;
    if (dragInsertPosition !== null || dragReplacePosition !== null) {
      fancyDragIndicator = React.createElement(FancyDragIndicator, {
        dragInsertPosition,
        dragReplacePosition
      });
    }

    return JSX(`
      <div
        className={'filter-tile ' + (dragOver ? 'drag-over' : 'no-drag')}
        onDragOver={this.dragOver.bind(this)}
        onDragEnter={this.dragEnter.bind(this)}
        onDragLeave={this.dragLeave.bind(this)}
        onDrop={this.drop.bind(this)}
      >
        <div className="title">Filter</div>
        <div className="items" ref="items">
          {filterItems}
        </div>
        {fancyDragIndicator}
        {this.renderMenu()}
      </div>
    `);
  }
}
