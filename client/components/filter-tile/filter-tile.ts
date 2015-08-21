'use strict';

import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { Timezone } from 'chronology';
import { $, Expression, ChainExpression, InAction, Executor, Dataset } from 'plywood';
import { CORE_ITEM_HEIGHT, CORE_ITEM_GAP } from '../../config/constants';
import { Clicker, DataSource, Filter, Dimension, Measure } from '../../models/index';
import { formatStartEnd } from '../../utils/date';
import { dataTransferTypesContain, setDragGhost } from '../../utils/dom';

interface FilterTileProps {
  clicker: Clicker;
  dataSource: DataSource;
  filter: Filter;
  timezone: Timezone;
  selectedDimension: Dimension;
  triggerMenuOpen: (target: Element, dimension: Dimension) => void;
}

interface FilterTileState {
  dragOver?: boolean;
  dragPosition?: number;
}

export class FilterTile extends React.Component<FilterTileProps, FilterTileState> {
  private dragCounter: number;

  constructor() {
    super();
    this.state = {
      dragOver: false,
      dragPosition: null
    };
  }

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  componentWillReceiveProps(nextProps: FilterTileProps) {

  }

  selectDimension(dimension: Dimension, e: MouseEvent) {
    var { triggerMenuOpen } = this.props;
    triggerMenuOpen(<Element>e.target, dimension);
  }

  removeFilter(expression: ChainExpression, e: MouseEvent) {
    var { filter, clicker } = this.props;
    clicker.changeFilter(filter.remove(expression));
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

  calculateDragPosition(e: DragEvent) {
    this.setState({ dragPosition: 0 });
  }

  canDrop(e: DragEvent): boolean {
    return dataTransferTypesContain(e.dataTransfer.types, "text/dimension");
  }

  dragOver(e: DragEvent) {
    if (!this.canDrop(e)) return;
    e.dataTransfer.dropEffect = 'move';
    e.preventDefault();
    this.calculateDragPosition(e);
  }

  dragEnter(e: DragEvent) {
    if (!this.canDrop(e)) return;
    var { dragOver } = this.state;
    if (!dragOver) {
      this.dragCounter = 0;
      this.setState({ dragOver: true });
      this.calculateDragPosition(e);
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
        dragPosition: null
      });
    } else {
      this.dragCounter--;
    }
  }

  drop(e: DragEvent) {
    if (!this.canDrop(e)) return;
    var { clicker, dataSource } = this.props;
    var { dragPosition } = this.state;

    console.log('drop into filter');

    this.dragCounter = 0;
    this.setState({
      dragOver: false,
      dragPosition: null
    });
  }

  formatValue(dimension: Dimension, operand: ChainExpression, timezone: Timezone) {
    switch (dimension.type) {
      case 'STRING':
        var inAction = operand.actions[0];
        if (inAction instanceof InAction) {
          var setLiteral = inAction.getLiteralValue();
          if (!setLiteral) return '?';
          return setLiteral.elements.join(', ');
        } else {
          return '[not in]';
        }
        break;

      case 'TIME':
        var inAction = operand.actions[0];
        if (inAction instanceof InAction) {
          var timeRangeLiteral = inAction.getLiteralValue();
          if (!timeRangeLiteral) return '?';
          return formatStartEnd(timeRangeLiteral.start, timeRangeLiteral.end, timezone).join(' -> ');
        } else {
          return '[not in]';
        }
        break;

      default:
        throw new Error('unknown type ' + dimension.type);
    }
  }

  render() {
    var { dataSource, filter, timezone, selectedDimension } = this.props;
    var { dragOver, dragPosition } = this.state;

    var itemY = 0;
    var filterItems: Array<React.ReactElement<any>> = null;
    if (dataSource.metadataLoaded) {
      filterItems = filter.operands.toArray().map((operand, i) => {
        var operandExpression = operand.expression;
        var dimension = dataSource.dimensions.find((d) => d.expression.equals(operandExpression));
        if (!dimension) throw new Error('dimension not found');

        if (i) itemY += CORE_ITEM_GAP;
        if (dragOver && dragPosition === i) itemY += CORE_ITEM_HEIGHT;
        var style = { transform: `translate3d(0,${itemY}px,0)` };
        itemY += CORE_ITEM_HEIGHT;

        var classNames = [
          'filter',
          dimension.className
        ];
        if (dimension === selectedDimension) classNames.push('selected');
        return JSX(`
          <div
            className={classNames.join(' ')}
            key={dimension.name}
            draggable="true"
            onClick={this.selectDimension.bind(this, dimension)}
            onDragStart={this.dragStart.bind(this, dimension, operand)}
            style={style}
          >
            <div className="reading">{dimension.title + ': ' + this.formatValue(dimension, operand, timezone)}</div>
            <div className="remove" onClick={this.removeFilter.bind(this, operandExpression)}>
              <Icon name="x" width={12} height={12}/>
            </div>
          </div>
        `);
      }, this);
      if (dragOver && dragPosition === filter.operands.size) itemY += CORE_ITEM_HEIGHT;
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
        <div className="items" ref="filterItems" style={{ height: itemY }}>
          {filterItems}
        </div>
      </div>
    `);
  }
}
