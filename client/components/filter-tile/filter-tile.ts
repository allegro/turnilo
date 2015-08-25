'use strict';

import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { Timezone, Duration, hour, day, week } from 'chronology';
import { $, Expression, ChainExpression, InAction, Executor, Dataset } from 'plywood';
import { CORE_ITEM_HEIGHT, CORE_ITEM_GAP } from '../../config/constants';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../models/index';
import { formatStartEnd } from '../../utils/date';
import { findParentWithClass, dataTransferTypesContain, setDragGhost } from '../../utils/dom';
import { BubbleMenu } from '../bubble-menu/bubble-menu';
import { MenuHeader } from '../menu-header/menu-header';
import { MenuTable } from '../menu-table/menu-table';
import { MenuTimeSeries } from '../menu-time-series/menu-time-series';

const FILTER_CLASS_NAME = 'filter';

var tz = Timezone.UTC;
var now = hour.ceil(new Date(), tz);
const TIME_PRESETS: TimePreset[] = [
  TimePreset.fromJS({
    name: 'Past hour',
    timeRange: {
      start: hour.floor(now, tz),
      end: now
    }
  }),
  TimePreset.fromJS({
    name: 'Past 6 hours',
    timeRange: {
      start: hour.move(hour.floor(now, tz), tz, -5),
      end: now
    }
  }),
  TimePreset.fromJS({
    name: 'Past day',
    timeRange: {
      start: day.floor(now, tz),
      end: now
    }
  }),
  TimePreset.fromJS({
    name: 'Past 7 days',
    timeRange: {
      start: day.move(day.floor(now, tz), tz, -6),
      end: now
    }
  }),
  TimePreset.fromJS({
    name: 'Past week',
    timeRange: {
      start: week.floor(now, tz),
      end: now
    }
  })
];

interface FilterTileProps {
  clicker: Clicker;
  essence: Essence;
  menuStage: Stage;
}

interface FilterTileState {
  menuOpenOn?: Element;
  menuDimension?: Dimension;
  dragOver?: boolean;
  dragPosition?: number;
}

export class FilterTile extends React.Component<FilterTileProps, FilterTileState> {
  private dragCounter: number;

  constructor() {
    super();
    this.state = {
      menuOpenOn: null,
      menuDimension: null,
      dragOver: false,
      dragPosition: null
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

  onPresetClick(preset: TimePreset) {
    console.log('preset-click', preset.timeRange);
    var { clicker } = this.props;
    clicker.changeTimeRange(preset.timeRange);
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
    var { clicker, essence } = this.props;
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

  renderMenu(): React.ReactElement<any> {
    var { essence, clicker, menuStage } = this.props;
    var { menuOpenOn, menuDimension } = this.state;
    if (!menuDimension) return null;
    var onClose = this.closeMenu.bind(this);

    var menuSize: Stage = null;
    var menuCont: React.DOMElement<any> = null;
    if (menuDimension.type === 'TIME') {
      var presets = TIME_PRESETS.map((preset) => {
        return JSX(`
          <li key={preset.name} onClick={this.onPresetClick.bind(this, preset)}>
            {preset.name}
          </li>
        `);
      });

      menuSize = Stage.fromSize(550, 300);
      var menuVisSize = menuSize.within({ left: 200, top: 40, bottom: 52 });  // ToDo: remove magic numbers
      menuCont = JSX(`
        <div className="menu-cont presets">
          <ul>{presets}</ul>
          <MenuTimeSeries
            essence={essence}
            dimension={menuDimension}
            stage={menuVisSize}
          />
        </div>
      `);
    } else {
      menuSize = Stage.fromSize(250, 400);
      menuCont = JSX(`
        <div className="menu-cont">
          <MenuTable
            essence={essence}
            dimension={menuDimension}
            showSearch={true}
            showCheckboxes={true}
          />
        </div>
      `);
    }

    return JSX(`
      <BubbleMenu containerStage={menuStage} stage={menuSize} openOn={menuOpenOn} onClose={onClose}>
        <MenuHeader dimension={menuDimension}/>
        {menuCont}
      </BubbleMenu>
    `);
  }

  render() {
    var { essence } = this.props;
    var { menuDimension, dragOver, dragPosition } = this.state;
    var { dataSource, filter, timezone } = essence;

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
            <div className="reading">{dimension.title + ': ' + this.formatValue(dimension, operand, timezone)}</div>
            {removeButton}
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
        {this.renderMenu()}
      </div>
    `);
  }
}
