'use strict';

import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { Timezone, Duration, hour, day, week } from 'chronology';
import { $, Expression, ChainExpression, InAction, Executor, Dataset } from 'plywood';
import { CORE_ITEM_WIDTH, CORE_ITEM_GAP } from '../../config/constants';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../models/index';
import { calculateDragPosition, DragPosition } from '../../utils/general';
import { formatStartEnd } from '../../utils/date';
import { findParentWithClass, dataTransferTypesContain, setDragGhost } from '../../utils/dom';
import { FilterMenu } from '../filter-menu/filter-menu';

const FILTER_CLASS_NAME = 'filter';

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
      dragReplacePosition: null
    };
  }

  clickDimension(dimension: Dimension, e: MouseEvent) {
    var { menuOpenOn } = this.state;
    var target = findParentWithClass(<Element>e.target, FILTER_CLASS_NAME);
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
      menuDimension: null
    });
  }

  removeFilter(expression: ChainExpression, e: MouseEvent) {
    var { essence, clicker } = this.props;
    clicker.changeFilter(essence.filter.remove(expression));
    e.stopPropagation();
  }

  dragStart(dimension: Dimension, operand: ChainExpression, e: DragEvent) {
    var dataTransfer = e.dataTransfer;
    // dataTransfer.effectAllowed = 'linkMove'; // Alt: set this to just 'move'
    dataTransfer.setData("text/url-list", 'http://imply.io'); // ToDo: make this generate a real URL
    dataTransfer.setData("text/plain", 'http://imply.io');
    dataTransfer.setData("text/dimension", dimension.name);

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
    return dataTransferTypesContain(e.dataTransfer.types, "text/dimension");
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
    var { filter } = essence;

    var dimensionName = e.dataTransfer.getData("text/dimension");
    var dimension = essence.dataSource.getDimension(dimensionName);
    var { dragReplacePosition, dragInsertPosition } = this.calculateDragPosition(e);
    console.log('drop into filter');

    this.dragCounter = 0;
    this.setState({
      dragOver: false,
      dragInsertPosition: null,
      dragReplacePosition: null
    });
  }

  formatLabel(dimension: Dimension, operand: ChainExpression, timezone: Timezone): string {
    var label = dimension.title + ' ';

    switch (dimension.type) {
      case 'STRING':
        var inAction = operand.actions[0];
        if (inAction instanceof InAction) {
          var setLiteral = inAction.getLiteralValue();
          if (!setLiteral) return '?';
          label += `(${setLiteral.elements.length})`;
        } else {
          label += '[not in]';
        }
        break;

      case 'TIME':
        var inAction = operand.actions[0];
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

  renderMenu(): React.ReactElement<any> {
    var { essence, clicker, menuStage } = this.props;
    var { menuOpenOn, menuDimension } = this.state;
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
        onClose={onClose}
      />
    `);
  }

  render() {
    var { essence } = this.props;
    var { menuDimension, dragOver, dragInsertPosition, dragReplacePosition } = this.state;
    var { dataSource, filter, timezone } = essence;

    var sectionWidth = CORE_ITEM_WIDTH + CORE_ITEM_GAP;

    var itemX = 0;
    var filterItems: Array<React.ReactElement<any>> = null;
    if (dataSource.metadataLoaded) {
      filterItems = filter.operands.toArray().map((operand, i) => {
        var operandExpression = operand.expression;
        var dimension = dataSource.dimensions.find((d) => d.expression.equals(operandExpression));
        if (!dimension) throw new Error('dimension not found');

        var style = { transform: `translate3d(${itemX}px,0,0)` };
        itemX += sectionWidth;

        var removeButton: React.DOMElement<any> = null;
        if (!operandExpression.equals(dataSource.timeAttribute)) {
          removeButton = JSX(`
            <div className="remove" onClick={this.removeFilter.bind(this, operandExpression)}>
              <Icon name="x"/>
            </div>
          `);
        }

        var classNames = [
          FILTER_CLASS_NAME,
          dimension.className
        ];
        if (dimension === menuDimension) classNames.push('selected');
        return JSX(`
          <div
            className={classNames.join(' ')}
            key={dimension.name}
            draggable="true"
            onClick={this.clickDimension.bind(this, dimension)}
            onDragStart={this.dragStart.bind(this, dimension, operand)}
            style={style}
          >
            <div className="reading">{this.formatLabel(dimension, operand, timezone)}</div>
            {removeButton}
          </div>
        `);
      }, this);
    }

    var dragGhostArrow: React.DOMElement<any> = null;
    if (dragInsertPosition !== null || dragReplacePosition !== null) {
      let left: number;
      if (dragInsertPosition !== null) {
        left = dragInsertPosition * sectionWidth - CORE_ITEM_GAP / 2;
      } else {
        left = dragReplacePosition * sectionWidth + CORE_ITEM_WIDTH / 2;
      }
      dragGhostArrow = JSX(`<div className="drag-ghost-arrow" key="ghost-arrow" style={{left: left}}></div>`);
    }

    var dragGhostElement: React.DOMElement<any> = null;
    if (dragReplacePosition !== null) {
      let left = dragReplacePosition * sectionWidth;
      dragGhostElement = JSX(`<div className="drag-ghost-element" key="ghost-element" style={{left: left}}></div>`);
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
          {dragGhostArrow}
          {dragGhostElement}
        </div>
        {this.renderMenu()}
      </div>
    `);
  }
}
