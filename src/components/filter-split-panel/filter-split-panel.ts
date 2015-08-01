'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import * as d3 from 'd3';
import { Timezone } from "chronology";
import { $, Expression, Dispatcher, InAction, ChainExpression, LiteralExpression, find } from 'plywood';
import { moveInList } from '../../utils/general';
import { formatStartEnd } from '../../utils/date';
import { dataTransferTypesContain } from '../../utils/dom';
import { DataSource, Filter, SplitCombine, Dimension, Measure, Clicker } from "../../models/index";
import { FilterSplitMenu } from "../filter-split-menu/filter-split-menu";

enum Section { Filter, Splits, Dimensions }

interface FilterSplitPanelProps {
  clicker: Clicker;
  dataSource: DataSource;
  filter: Filter;
  splits: List<SplitCombine>;
  timezone: Timezone;
}

interface FilterSplitPanelState {
  selectedDimension?: Dimension;
  anchor?: number;
  rect?: ClientRect;
  trigger?: Element;
  dragSection?: Section;
  dragPosition?: number;
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
    this.globalResizeListener = this.globalResizeListener.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.globalResizeListener);
    this.globalResizeListener();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.globalResizeListener);
  }

  globalResizeListener() {
    this.setState({
      rect: React.findDOMNode(this).getBoundingClientRect()
    });
  }

  componentWillReceiveProps(nextProps: FilterSplitPanelProps) {

  }

  selectDimension(dimension: Dimension, e: MouseEvent) {
    var target = <Element>e.target;
    var currentTrigger = this.state.trigger;
    if (currentTrigger === target) {
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
    clicker.changeFilter(filter.remove(expression));
    e.stopPropagation();
  }

  removeSplit(split: SplitCombine, e: MouseEvent) {
    var { clicker } = this.props;
    clicker.removeSplit(split);
    e.stopPropagation();
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

  calculateDragPosition(section: Section, e: DragEvent) {
    var itemHeight = 30;
    if (section !== Section.Dimensions) {
      this.setState({ dragPosition: 0 });
      return;
    }

    var numItems = this.props.dataSource.dimensions.size;
    var rect = React.findDOMNode(this.refs['dimensionItems']).getBoundingClientRect();
    var offset = e.clientY - rect.top;

    this.setState({
      dragPosition: Math.min(Math.max(0, Math.round(offset / itemHeight)), numItems)
    });
  }

  canDrop(section: Section, e: DragEvent) {
    return dataTransferTypesContain(e.dataTransfer.types, "text/dimension");
  }

  dragOver(section: Section, e: DragEvent) {
    if (!this.canDrop(section, e)) return;
    e.dataTransfer.dropEffect = 'move';
    e.preventDefault();
    this.calculateDragPosition(section, e);
  }

  dragEnter(section: Section, e: DragEvent) {
    if (!this.canDrop(section, e)) return;
    var { dragSection } = this.state;
    if (dragSection !== section) {
      this.dragCounter = 0;
      this.setState({ dragSection: section });
      this.calculateDragPosition(section, e);
    } else {
      this.dragCounter++;
    }
  }

  dragLeave(section: Section, e: DragEvent) {
    if (!this.canDrop(section, e)) return;
    var { dragSection } = this.state;
    if (dragSection !== section) return;
    if (this.dragCounter === 0) {
      this.setState({
        dragSection: null,
        dragPosition: null
      });
    } else {
      this.dragCounter--;
    }
  }

  drop(section: Section, e: DragEvent) {
    if (!this.canDrop(section, e)) return;
    var { clicker, dataSource } = this.props;
    var { dragPosition } = this.state;

    var dimension = dataSource.getDimension(e.dataTransfer.getData("text/dimension"));
    if (section === Section.Splits) {
      clicker.addSplit(dimension.getSplitCombine());
    } else if (section === Section.Dimensions) {
      var dimensions = dataSource.dimensions;
      var dimensionName = dimension.name;
      var index = dimensions.findIndex((d) => d.name === dimensionName);
      if (index !== -1 && index !== dragPosition) {
        clicker.changeDataSource(dataSource.changeDimensions(moveInList(dimensions, index, dragPosition)));
      }
    } else {
      console.log('drop into ' + section);
    }

    this.dragCounter = 0;
    this.setState({
      dragSection: null,
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
    var { dataSource, filter, splits, clicker, timezone } = this.props;
    var { selectedDimension, anchor, rect, trigger, dragSection, dragPosition } = this.state;
    const itemHeight = 30;

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

    var filterItemY = 0;
    var filterItems = filter.operands.toArray().map((operand, i) => {
      var operandExpression = operand.expression;
      var dimension = dataSource.dimensions.find((d) => d.expression.equals(operandExpression));
      if (!dimension) throw new Error('dimension not found');

      if (dragSection === Section.Filter && dragPosition === i) filterItemY += itemHeight;
      var style = { transform: `translate3d(0,${filterItemY}px,0)` };
      filterItemY += itemHeight;

      return JSX(`
        <div
          className={'item filter' + (dimension === selectedDimension ? ' selected' : '')}
          key={dimension.name}
          draggable="true"
          onClick={this.selectDimension.bind(this, dimension)}
          onDragStart={this.filterDragStart.bind(this, dimension, operand)}
          style={style}
        >
          <div className="reading">{dimension.title}: {this.formatValue(dimension, operand, timezone)}</div>
          <div className="remove" onClick={this.removeFilter.bind(this, operandExpression)}>x</div>
        </div>
      `);
    }, this);
    if (dragSection === Section.Filter && dragPosition === filter.operands.size) filterItemY += itemHeight;

    var splitItemY = 0;
    var splitItems = splits.toArray().map((split, i) => {
      var dimension = dataSource.getDimension(split.dimension);
      if (!dimension) throw new Error('dimension not found');

      if (dragSection === Section.Splits && dragPosition === i) splitItemY += itemHeight;
      var style = { transform: `translate3d(0,${splitItemY}px,0)` };
      splitItemY += itemHeight;

      return JSX(`
        <div
          className={'item split' + (dimension === selectedDimension ? ' selected' : '')}
          key={dimension.name}
          draggable="true"
          onClick={this.selectDimension.bind(this, dimension)}
          onDragStart={this.splitDragStart.bind(this, dimension, split)}
          style={style}
        >
          <div className="reading">{dimension.title}</div>
          <div className="remove" onClick={this.removeSplit.bind(this, split)}>x</div>
        </div>
      `);
    }, this);
    if (dragSection === Section.Splits && dragPosition === splits.size) splitItemY += itemHeight;

    var dimensionItemY = 0;
    var dimensionItems = dataSource.dimensions.toArray().map((dimension, i) => {
      if (dragSection === Section.Dimensions && dragPosition === i) dimensionItemY += itemHeight;
      var style = { transform: `translate3d(0,${dimensionItemY}px,0)` };
      dimensionItemY += itemHeight;
      var iconText = dimension.type === 'TIME' ? 'Ti' : 'Ab';

      return JSX(`
        <div
          className={'item dimension' + (dimension === selectedDimension ? ' selected' : '')}
          key={dimension.name}
          draggable="true"
          onClick={this.selectDimension.bind(this, dimension)}
          onDragStart={this.dimensionDragStart.bind(this, dimension)}
          style={style}
        >
          <div className="icon">{iconText}</div>
          {dimension.title}
        </div>
      `);
    }, this);
    if (dragSection === Section.Dimensions && dragPosition === dataSource.dimensions.size) dimensionItemY += itemHeight;

    return JSX(`
      <div className="filter-split-panel">
        <div
          className={'filters section ' + (dragSection === Section.Filter ? 'drag-over' : 'no-drag')}
          onDragOver={this.dragOver.bind(this, Section.Filter)}
          onDragEnter={this.dragEnter.bind(this, Section.Filter)}
          onDragLeave={this.dragLeave.bind(this, Section.Filter)}
          onDrop={this.drop.bind(this, Section.Filter)}
        >
          <div className="title">Filter</div>
          <div className="items" ref="filterItems" style={{ height: filterItemY + 'px' }}>
            {filterItems}
          </div>
        </div>
        <div
          className={'splits section ' + (dragSection === Section.Splits ? 'drag-over' : 'no-drag')}
          onDragOver={this.dragOver.bind(this, Section.Splits)}
          onDragEnter={this.dragEnter.bind(this, Section.Splits)}
          onDragLeave={this.dragLeave.bind(this, Section.Splits)}
          onDrop={this.drop.bind(this, Section.Splits)}
        >
          <div className="title">Split</div>
          <div className="items" ref="splitItems" style={{ height: splitItemY + 'px' }}>
            {splitItems}
          </div>
        </div>
        <div
          className={'dimensions section ' + (dragSection === Section.Dimensions ? 'drag-over' : 'no-drag')}
          onDragOver={this.dragOver.bind(this, Section.Dimensions)}
          onDragEnter={this.dragEnter.bind(this, Section.Dimensions)}
          onDragLeave={this.dragLeave.bind(this, Section.Dimensions)}
          onDrop={this.drop.bind(this, Section.Dimensions)}
        >
          <div className="title">Dimensions</div>
          <div className="items" ref="dimensionItems">
            {dimensionItems}
            <div className="dummy-item" style={{ top: dimensionItemY + 'px' }}></div>
          </div>
        </div>
        {menu}
      </div>
    `);
  }
}
