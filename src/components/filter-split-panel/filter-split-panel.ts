'use strict';

import React = require('react');
import { $, Expression, Dispatcher, InAction, ChainExpression, LiteralExpression } from 'plywood';
import { Filter, Dimension, Measure, Clicker } from "../../models/index";
import { FilterSplitMenu } from "../filter-split-menu/filter-split-menu";

interface FilterSplitPanelProps {
  clicker: Clicker;
  dispatcher: Dispatcher;
  filter: Filter;
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

  removeFilter(expression: Expression, e: MouseEvent) {
    var { filter, clicker } = this.props;
    clicker.setFilter(filter.remove(expression));
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
          var setLiteral = inAction.expression;
          if (setLiteral instanceof LiteralExpression) {
            var value = setLiteral.value;
            return value.elements.join(', ');
          } else {
            return 'S0';
          }
        } else {
          return 'S';
        }
        break;

      case 'TIME':
        return 'T';

      default:
        throw new Error('unknown type ' + dimension.type);
    }
  }

  render() {
    var { dispatcher, filter, dimensions, clicker } = this.props;
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

      var dimension: Dimension = null;
      for (let d of dimensions) {
        if (d.expression.equals(operandExpression)) {
          dimension = d;
          break;
        }
      }
      if (!dimension) throw new Error('dimension not found');

      return JSX(`
        <div
          className={'item filter' + (dimension === selectedDimension ? ' selected' : '')}
          key={dimension.name}
          onClick={this.selectDimension.bind(this, dimension)}
          draggable="true"
        >
          <div className="reading">{dimension.title}: {this.formatValue(dimension, operand)}</div>
          <div className="remove" onClick={this.removeFilter.bind(this, operandExpression)}>x</div>
        </div>
      `);
    }, this);

    var dimensionItems = dimensions.map(dimension => {
      return JSX(`
        <div
          className={'item dimension' + (dimension === selectedDimension ? ' selected' : '')}
          key={dimension.name}
          onClick={this.selectDimension.bind(this, dimension)}
          draggable="true"
        >{dimension.title}</div>
      `);
    });

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
          <div className="items">
            <div className="item split" draggable="true">Language</div>
          </div>
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
