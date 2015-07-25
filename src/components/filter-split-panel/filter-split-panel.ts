'use strict';

import React = require('react');
import { $, Expression, Dispatcher, InAction, ChainExpression, LiteralExpression, find } from 'plywood';
import { Filter, SplitCombine, Dimension, Measure, Clicker } from "../../models/index";
import { FilterSplitMenu } from "../filter-split-menu/filter-split-menu";

interface FilterSplitPanelProps {
  clicker: Clicker;
  dispatcher: Dispatcher;
  filter: Filter;
  splits: SplitCombine[];
  dimensions: Dimension[];
}

interface FilterSplitPanelState {
  selectedDimension?: Dimension;
  anchor?: number;
  rect?: ClientRect;
  dragSection?: string;
}

export class FilterSplitPanel extends React.Component<FilterSplitPanelProps, FilterSplitPanelState> {
  private dragCounter: number;

  constructor() {
    super();
    this.state = {
      selectedDimension: null,
      anchor: null,
      rect: null,
      dragSection: null
    };
    this.keyDownListener = this.keyDownListener.bind(this);
    this.resizeListener = this.resizeListener.bind(this);
  }

  componentDidMount() {
    window.addEventListener('keydown', this.keyDownListener);
    window.addEventListener('resize', this.resizeListener);
    this.resizeListener();
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.keyDownListener);
    window.removeEventListener('resize', this.resizeListener);
  }

  componentWillReceiveProps(nextProps: FilterSplitPanelProps) {

  }

  selectDimension(dimension: Dimension, e: MouseEvent) {
    var target = <Element>e.target;
    var targetRect = target.getBoundingClientRect();
    var containerRect = this.state.rect;
    this.setState({
      selectedDimension: dimension,
      anchor: targetRect.top - containerRect.top + Math.floor(targetRect.height / 2)
    });
  }

  removeFilter(expression: ChainExpression, e: MouseEvent) {
    var { filter, clicker } = this.props;
    clicker.setFilter(filter.remove(expression));
    e.stopPropagation();
  }

  removeSplit(split: SplitCombine, e: MouseEvent) {
    var { filter, clicker } = this.props;
    clicker.removeSplit(split);
    e.stopPropagation();
  }

  keyDownListener(event: KeyboardEvent) {
    if (event.which !== 27) return; // 27 = escape
    this.onMenuClose();
  }

  resizeListener() {
    this.setState({
      rect: React.findDOMNode(this).getBoundingClientRect()
    });
  }

  onMenuClose() {
    this.setState({
      selectedDimension: null,
      anchor: null
    });
  }

  filterDragStart(dimension: Dimension, operand: ChainExpression, e: DragEvent) {
    e.dataTransfer.setData("text/dimension", dimension.name);
    // ToDo: add e.dataTransfer.setData("text/filter", ...);
  }

  splitDragStart(dimension: Dimension, operand: ChainExpression, e: DragEvent) {
    e.dataTransfer.setData("text/dimension", dimension.name);
    // ToDo: add e.dataTransfer.setData("text/split", ...);
  }

  dimensionDragStart(dimension: Dimension, e: DragEvent) {
    e.dataTransfer.setData("text/dimension", dimension.name);
  }

  dragOver(section: string, e: DragEvent) {
    e.preventDefault();
  }

  dragEnter(section: string, e: DragEvent) {
    var { dragSection } = this.state;
    if (dragSection !== section) {
      this.dragCounter = 0;
      this.setState({
        dragSection: section
      });
    } else {
      this.dragCounter++;
    }
  }

  dragLeave(section: string, e: DragEvent) {
    var { dragSection } = this.state;
    if (dragSection !== section) return;
    if (this.dragCounter === 0) {
      this.setState({
        dragSection: null
      });
    } else {
      this.dragCounter--;
    }
  }

  drop(section: string, e: DragEvent) {
    this.dragCounter = 0;
    this.setState({
      dragSection: null
    });
    console.log('drop into ' + section);
  }

  formatValue(dimension: Dimension, operand: ChainExpression) {
    switch (dimension.type) {
      case 'STRING':
        var inAction = operand.actions[0];
        if (inAction instanceof InAction) {
          var setLiteral = inAction.getLiteralValue();
          if (!setLiteral) return '?';
          return setLiteral.elements.join(', ');
        } else {
          return 'S';
        }
        break;

      case 'TIME':
        return 'T -> T';

      default:
        throw new Error('unknown type ' + dimension.type);
    }
  }

  render() {
    var { dispatcher, filter, splits, dimensions, clicker } = this.props;
    var { selectedDimension, anchor, rect, dragSection } = this.state;

    var menu: React.ReactElement<any> = null;
    if (selectedDimension) {
      menu = JSX(`<FilterSplitMenu
        clicker={clicker}
        dispatcher={dispatcher}
        filter={filter}
        dimension={selectedDimension}
        anchor={anchor}
        height={rect.height}
        onClose={this.onMenuClose.bind(this)}
      />`);
    }

    var filterItems = filter.operands.map(operand => {
      var operandExpression = operand.expression;
      var dimension = find(dimensions, (d) => d.expression.equals(operandExpression));
      if (!dimension) throw new Error('dimension not found');

      return JSX(`
        <div
          className={'item filter' + (dimension === selectedDimension ? ' selected' : '')}
          key={dimension.name}
          draggable="true"
          onClick={this.selectDimension.bind(this, dimension)}
          onDragStart={this.filterDragStart.bind(this, dimension, operand)}
        >
          <div className="reading">{dimension.title}: {this.formatValue(dimension, operand)}</div>
          <div className="remove" onClick={this.removeFilter.bind(this, operandExpression)}>x</div>
        </div>
      `);
    }, this);

    var splitItems = splits.map(split => {
      var splitExpression = split.splitOn;
      var dimension = find(dimensions, (d) => d.expression.equals(splitExpression));
      if (!dimension) throw new Error('dimension not found');

      return JSX(`
        <div
          className={'item split' + (dimension === selectedDimension ? ' selected' : '')}
          key={dimension.name}
          draggable="true"
          onClick={this.selectDimension.bind(this, dimension)}
          onDragStart={this.splitDragStart.bind(this, dimension, split)}
        >
          <div className="reading">{dimension.title}</div>
          <div className="remove" onClick={this.removeSplit.bind(this, split)}>x</div>
        </div>
      `);
    }, this);

    var dimensionItems = dimensions.map(dimension => {
      return JSX(`
        <div
          className={'item dimension' + (dimension === selectedDimension ? ' selected' : '')}
          key={dimension.name}
          draggable="true"
          onClick={this.selectDimension.bind(this, dimension)}
          onDragStart={this.dimensionDragStart.bind(this, dimension)}
        >{dimension.title}</div>
      `);
    }, this);

    return JSX(`
      <div className="filter-split-panel">
        <div
          className={'filters section' + (dragSection === 'filters' ? ' drag-over' : '')}
          onDragOver={this.dragOver.bind(this, 'filters')}
          onDragEnter={this.dragEnter.bind(this, 'filters')}
          onDragLeave={this.dragLeave.bind(this, 'filters')}
          onDrop={this.drop.bind(this, 'filters')}
        >
          <div className="title">Filter</div>
          <div className="items">{filterItems}</div>
        </div>
        <div
          className={'splits section' + (dragSection === 'splits' ? ' drag-over' : '')}
          onDragOver={this.dragOver.bind(this, 'splits')}
          onDragEnter={this.dragEnter.bind(this, 'splits')}
          onDragLeave={this.dragLeave.bind(this, 'splits')}
          onDrop={this.drop.bind(this, 'splits')}
        >
          <div className="title">Split</div>
          <div className="items">{splitItems}</div>
        </div>
        <div
          className={'dimensions section' + (dragSection === 'dimensions' ? ' drag-over' : '')}
          onDragOver={this.dragOver.bind(this, 'dimensions')}
          onDragEnter={this.dragEnter.bind(this, 'dimensions')}
          onDragLeave={this.dragLeave.bind(this, 'dimensions')}
          onDrop={this.drop.bind(this, 'dimensions')}
        >
          <div className="title">Dimensions</div>
          <div className="items">{dimensionItems}</div>
        </div>
        {menu}
      </div>
    `);
  }
}
