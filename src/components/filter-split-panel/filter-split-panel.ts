'use strict';

import React = require('react');
import d3 = require('d3');
import { $, Expression, Dispatcher, InAction, ChainExpression, LiteralExpression, find } from 'plywood';
import { DataSource, Filter, SplitCombine, Dimension, Measure, Clicker } from "../../models/index";
import { FilterSplitMenu } from "../filter-split-menu/filter-split-menu";

interface FilterSplitPanelProps {
  clicker: Clicker;
  dataSource: DataSource;
  filter: Filter;
  splits: SplitCombine[];
}

interface FilterSplitPanelState {
  selectedDimension?: Dimension;
  anchor?: number;
  rect?: ClientRect;
  trigger?: Element;
  dragSection?: string;
}

function dataTransferTypesContain(types: any, neededType: string): boolean {
  if (Array.isArray(types)) {
    return types.indexOf(neededType) !== -1;
  } else if (types instanceof DOMStringList) {
    return types.contains(neededType);
  }
  return false;
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
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
    this.globalResizeListener = this.globalResizeListener.bind(this);
  }

  componentDidMount() {
    window.addEventListener('keydown', this.globalKeyDownListener);
    window.addEventListener('resize', this.globalResizeListener);
    this.globalResizeListener();
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.globalKeyDownListener);
    window.removeEventListener('resize', this.globalResizeListener);
  }

  componentWillReceiveProps(nextProps: FilterSplitPanelProps) {

  }

  selectDimension(dimension: Dimension, e: MouseEvent) {
    var target = <Element>e.target;
    var currentTriger = this.state.trigger;
    if (currentTriger === target) {
      this.onMenuClose();
      return;
    }
    var targetRect = target.getBoundingClientRect();
    var containerRect = this.state.rect;
    this.setState({
      selectedDimension: dimension,
      anchor: targetRect.top - containerRect.top + Math.floor(targetRect.height / 2),
      trigger: target
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

  globalKeyDownListener(event: KeyboardEvent) {
    if (event.which !== 27) return; // 27 = escape
    this.onMenuClose();
  }

  globalResizeListener() {
    this.setState({
      rect: React.findDOMNode(this).getBoundingClientRect()
    });
  }

  onMenuClose() {
    this.setState({
      selectedDimension: null,
      anchor: null,
      trigger: null
    });
  }

  filterDragStart(dimension: Dimension, operand: ChainExpression, e: DragEvent) {
    // ToDo: add e.dataTransfer.setData("text/filter", ...);
    this.dimensionDragStart(dimension, e);
  }

  splitDragStart(dimension: Dimension, operand: ChainExpression, e: DragEvent) {
    // ToDo: add e.dataTransfer.setData("text/split", ...);
    this.dimensionDragStart(dimension, e);
  }

  dimensionDragStart(dimension: Dimension, e: DragEvent) {
    var dataTransfer = e.dataTransfer;
    // dataTransfer.effectAllowed = 'linkMove'; // Alt: set this to just 'move'
    dataTransfer.setData("text/url-list", 'http://imply.io'); // ToDo: make this generate a real URL
    dataTransfer.setData("text/plain", 'http://imply.io');
    dataTransfer.setData("text/dimension", dimension.name);

    // Thanks to http://www.kryogenix.org/code/browser/custom-drag-image.html
    var dragGhost = d3.select(document.body).append('div')
      .attr('class', 'drag-ghost')
      .text(dimension.title);

    // remove <any> when DataTransfer interface in lib.d.ts includes setDragImage
    (<any>dataTransfer).setDragImage(dragGhost.node(), -20, -20);

    // Remove the host after a ms because it is no longer needed
    setTimeout(() => {
      dragGhost.remove();
    }, 1);
  }

  canDrop(section: string, e: DragEvent) {
    return dataTransferTypesContain(e.dataTransfer.types, "text/dimension");
  }

  dragOver(section: string, e: DragEvent) {
    if (!this.canDrop(section, e)) return;
    e.dataTransfer.dropEffect = 'move';
    e.preventDefault();
  }

  dragEnter(section: string, e: DragEvent) {
    if (!this.canDrop(section, e)) return;
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
    if (!this.canDrop(section, e)) return;
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
    if (!this.canDrop(section, e)) return;
    var { clicker } = this.props;
    this.dragCounter = 0;
    this.setState({
      dragSection: null
    });
    if (section === 'splits') {
      var dataTransfer = e.dataTransfer;
      var dimensionName = dataTransfer.getData("text/dimension");
      clicker.addSplit(new SplitCombine($(dimensionName), null, null));
    } else {
      console.log('drop into ' + section);
    }
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
    var { dataSource, filter, splits, clicker } = this.props;
    var { selectedDimension, anchor, rect, trigger, dragSection } = this.state;

    var menu: React.ReactElement<any> = null;
    if (selectedDimension) {
      menu = JSX(`<FilterSplitMenu
        clicker={clicker}
        dataSource={dataSource}
        filter={filter}
        dimension={selectedDimension}
        anchor={anchor}
        height={rect.height}
        trigger={trigger}
        onClose={this.onMenuClose.bind(this)}
      />`);
    }

    var filterItems = filter.operands.map(operand => {
      var operandExpression = operand.expression;
      var dimension = find(dataSource.dimensions, (d) => d.expression.equals(operandExpression));
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
      var dimension = find(dataSource.dimensions, (d) => d.expression.equals(splitExpression));
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

    var dimensionItems = dataSource.dimensions.map(dimension => {
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
