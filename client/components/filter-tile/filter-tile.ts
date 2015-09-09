'use strict';

import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { Timezone, Duration, hour, day, week } from 'chronoshift';
import { $, Expression, ChainExpression, InAction, Executor, Dataset } from 'plywood';
import { CORE_ITEM_WIDTH, CORE_ITEM_GAP } from '../../config/constants';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../models/index';
import { calculateDragPosition, DragPosition } from '../../utils/general';
import { formatStartEnd } from '../../utils/date';
import { findParentWithClass, dataTransferTypesGet, setDragGhost } from '../../utils/dom';
import { FancyDragIndicator } from '../fancy-drag-indicator/fancy-drag-indicator';
import { FilterMenu } from '../filter-menu/filter-menu';

const FILTER_CLASS_NAME = 'filter';

interface ItemBlank {
  dimension: Dimension;
  clause?: ChainExpression;
}

interface FilterTileProps {
  clicker: Clicker;
  essence: Essence;
  menuStage: Stage;
}

interface FilterTileState {
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

  clickDimension(dimension: Dimension, e: MouseEvent) {
    var target = findParentWithClass(<Element>e.target, FILTER_CLASS_NAME);
    this.openMenu(dimension, target);
  }

  dummyMount(dimension: Dimension, dummy: React.Component<any, any>) {
    var { menuOpenOn } = this.state;
    if (menuOpenOn || !dummy) return;
    var target = React.findDOMNode(dummy);
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
    this.setState({
      menuOpenOn: null,
      menuDimension: null,
      possibleDimension: null,
      possibleInsertPosition: null,
      possibleReplacePosition: null
    });
  }

  removeFilter(expression: ChainExpression, e: MouseEvent) {
    var { essence, clicker } = this.props;
    clicker.changeFilter(essence.filter.remove(expression));
    e.stopPropagation();
  }

  dragStart(dimension: Dimension, clause: ChainExpression, e: DragEvent) {
    var { essence } = this.props;

    var newUrl = essence.getURL(); // .changeSplit(dimension.getSplitCombine())

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
    var rect = React.findDOMNode(this.refs['items']).getBoundingClientRect();
    var offset = e.clientX - rect.left;
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
      var { dragReplacePosition, dragInsertPosition } = this.calculateDragPosition(e);

      if (dragInsertPosition !== null || dragReplacePosition !== null) {
        var tryingToReplaceTime = false;
        if (dragReplacePosition !== null) {
          var potentialReplaceClause = filter.clauses.get(dragReplacePosition);
          tryingToReplaceTime = potentialReplaceClause && potentialReplaceClause.expression.equals(dataSource.timeAttribute);
        }

        if (!tryingToReplaceTime) {
          newState.possibleDimension = dimension;
          newState.possibleInsertPosition = dragInsertPosition;
          newState.possibleReplacePosition = dragReplacePosition;
        }
      }
    }

    this.dragCounter = 0;
    this.setState(newState);
  }

  // This would be called externally
  possibleDimensionAppend(dimension: Dimension) {
    var { essence } = this.props;
    this.setState({
      possibleDimension: dimension,
      possibleInsertPosition: essence.filter.length(),
      possibleReplacePosition: null
    });
  }

  formatLabel(dimension: Dimension, clause: ChainExpression, timezone: Timezone): string {
    var label = dimension.title + ' ';

    switch (dimension.type) {
      case 'STRING':
        var inAction = clause.actions[0];
        if (inAction instanceof InAction) {
          var setLiteral = inAction.getLiteralValue();
          if (!setLiteral) return '?';
          label += `(${setLiteral.elements.length})`;
        } else {
          label += '[not in]';
        }
        break;

      case 'TIME':
        var inAction = clause.actions[0];
        if (inAction instanceof InAction) {
          var timeRangeLiteral = inAction.getLiteralValue();
          if (!timeRangeLiteral) return '?';
          label = formatStartEnd(timeRangeLiteral.start, timeRangeLiteral.end, timezone).join(' -> ');
        } else {
          label += '[not in]';
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
    var { menuOpenOn, menuDimension, possibleInsertPosition, possibleReplacePosition } = this.state;
    if (!menuDimension) return null;
    var onClose = this.closeMenu.bind(this);

    return JSX(`
      <FilterMenu
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

  renderRemoveButton(clause: ChainExpression) {
    var dataSource = this.props.essence.dataSource;
    if (clause.expression.equals(dataSource.timeAttribute)) return null;
    return JSX(`
      <div className="remove" onClick={this.removeFilter.bind(this, clause.expression)}>
        <Icon name="x"/>
      </div>
    `);
  }

  render() {
    var { essence } = this.props;
    var {
      menuDimension, dragOver, dragInsertPosition, dragReplacePosition,
      possibleDimension, possibleInsertPosition, possibleReplacePosition
    } = this.state;
    var { dataSource, filter, timezone } = essence;

    const sectionWidth = CORE_ITEM_WIDTH + CORE_ITEM_GAP;

    var itemX = 0;
    var filterItems: Array<React.ReactElement<any>> = null;
    if (dataSource.metadataLoaded) {
      var itemsBlanks = filter.clauses.toArray()
        .map((clause): ItemBlank => {
          var dimension = dataSource.getDimensionByExpression(clause.expression);
          if (!dimension) return null;
          return {
            dimension,
            clause
          };
        })
        .filter(Boolean);

      if (possibleDimension) {
        var dummyBlank: ItemBlank = { dimension: possibleDimension };
        if (possibleInsertPosition !== null) {
          itemsBlanks.splice(possibleInsertPosition, 0, dummyBlank);
        }
        if (possibleReplacePosition !== null) {
          itemsBlanks[possibleReplacePosition] = dummyBlank;
        }
      }

      filterItems = itemsBlanks.map((itemsBlank) => {
        var { dimension, clause } = itemsBlank;

        var style = { transform: `translate3d(${itemX}px,0,0)` };
        itemX += sectionWidth;

        var classNames = [FILTER_CLASS_NAME, dimension.className];
        if (dimension === menuDimension) classNames.push('selected');

        var className = classNames.join(' ');
        var key = dimension.name;

        if (clause) {
          return JSX(`
            <div
              className={className}
              key={key}
              draggable="true"
              onClick={this.clickDimension.bind(this, dimension)}
              onDragStart={this.dragStart.bind(this, dimension, clause)}
              style={style}
            >
              <div className="reading">{this.formatLabel(dimension, clause, timezone)}</div>
              {this.renderRemoveButton(clause)}
            </div>
          `);
        } else {
          return JSX(`
            <div
              className={className}
              key={key}
              ref={this.dummyMount.bind(this, dimension)}
              style={style}
            >
              <div className="reading">{this.formatLabelDummy(dimension)}</div>
            </div>
          `);
        }
      });
    }

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
