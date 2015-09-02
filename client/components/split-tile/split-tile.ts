'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { $, Expression, Executor, Dataset } from 'plywood';
import { CORE_ITEM_WIDTH, CORE_ITEM_GAP } from '../../config/constants';
import { Stage, Clicker, Essence, DataSource, Filter, SplitCombine, Dimension, Measure } from '../../models/index';
import { calculateDragPosition, DragPosition } from '../../utils/general';
import { findParentWithClass, dataTransferTypesContain, setDragGhost } from '../../utils/dom';
import { SplitMenu } from '../split-menu/split-menu';

const SPLIT_CLASS_NAME = 'split';

interface SplitTileProps {
  clicker: Clicker;
  essence: Essence;
  menuStage: Stage;
}

interface SplitTileState {
  menuOpenOn?: Element;
  menuDimension?: Dimension;
  menuSplit?: SplitCombine;
  dragOver?: boolean;
  dragInsertPosition?: number;
  dragReplacePosition?: number;
}

export class SplitTile extends React.Component<SplitTileProps, SplitTileState> {
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

  selectDimensionSplit(dimension: Dimension, split: SplitCombine, e: MouseEvent) {
    var { menuOpenOn } = this.state;
    var target = findParentWithClass(<Element>e.target, SPLIT_CLASS_NAME);
    if (menuOpenOn === target) {
      this.closeMenu();
      return;
    }
    this.setState({
      menuOpenOn: target,
      menuDimension: dimension,
      menuSplit: split
    });
  }

  closeMenu() {
    this.setState({
      menuOpenOn: null,
      menuDimension: null,
      menuSplit: null
    });
  }

  removeSplit(split: SplitCombine, e: MouseEvent) {
    var { clicker } = this.props;
    clicker.removeSplit(split);
    e.stopPropagation();
  }

  dragStart(dimension: Dimension, split: SplitCombine, e: DragEvent) {
    var dataTransfer = e.dataTransfer;
    // dataTransfer.effectAllowed = 'linkMove'; // Alt: set this to just 'move'
    dataTransfer.setData("text/url-list", 'http://imply.io'); // ToDo: make this generate a real URL
    dataTransfer.setData("text/plain", 'http://imply.io');
    dataTransfer.setData("text/dimension", dimension.name);

    setDragGhost(dataTransfer, dimension.title);
  }

  calculateDragPosition(e: DragEvent): DragPosition {
    var { essence } = this.props;
    var numItems = essence.splits.length();
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
      var newState: SplitTileState = this.calculateDragPosition(e);
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
    var { splits } = essence;

    var dimensionName = e.dataTransfer.getData("text/dimension");
    var dimension = essence.dataSource.getDimension(dimensionName);
    if (!splits.splitsOnDimension(dimension)) {
      var newSplitCombine = dimension.getSplitCombine();
      var { dragReplacePosition, dragInsertPosition } = this.calculateDragPosition(e);
      if (dragReplacePosition !== null) {
        clicker.changeSplits(splits.replaceByIndex(dragReplacePosition, newSplitCombine));
      } else if (dragInsertPosition !== null) {
        clicker.changeSplits(splits.insertByIndex(dragInsertPosition, newSplitCombine));
      }
    }

    this.dragCounter = 0;
    this.setState({
      dragOver: false,
      dragInsertPosition: null,
      dragReplacePosition: null
    });
  }

  renderMenu(): React.ReactElement<any> {
    var { essence, clicker, menuStage } = this.props;
    var { menuOpenOn, menuDimension, menuSplit } = this.state;
    if (!menuDimension) return null;
    var onClose = this.closeMenu.bind(this);

    return JSX(`
      <SplitMenu
        clicker={clicker}
        essence={essence}
        direction="down"
        containerStage={menuStage}
        openOn={menuOpenOn}
        dimension={menuDimension}
        split={menuSplit}
        onClose={onClose}
      />
    `);
  }

  render() {
    var { essence } = this.props;
    var { menuDimension, dragOver, dragInsertPosition, dragReplacePosition } = this.state;
    var { dataSource, splits } = essence;

    var sectionWidth = CORE_ITEM_WIDTH + CORE_ITEM_GAP;

    var itemX = 0;
    var splitItems: Array<React.ReactElement<any>> = null;
    if (dataSource.metadataLoaded) {
      splitItems = splits.toArray().map((split, i) => {
        var dimension = split.getDimension(dataSource);
        if (!dimension) throw new Error('dimension not found');

        var style = { transform: `translate3d(${itemX}px,0,0)` };
        itemX += sectionWidth;

        var classNames = [
          SPLIT_CLASS_NAME,
          dimension.className
        ];
        if (dimension === menuDimension) classNames.push('selected');
        return JSX(`
          <div
            className={classNames.join(' ')}
            key={dimension.name}
            draggable="true"
            onClick={this.selectDimensionSplit.bind(this, dimension, split)}
            onDragStart={this.dragStart.bind(this, dimension, split)}
            style={style}
          >
            <div className="reading">{split.getTitle(dataSource)}</div>
            <div className="remove" onClick={this.removeSplit.bind(this, split)}>
              <Icon name="x" width={12} height={12}/>
            </div>
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
        className={'split-tile ' + (dragOver ? 'drag-over' : 'no-drag')}
        onDragOver={this.dragOver.bind(this)}
        onDragEnter={this.dragEnter.bind(this)}
        onDragLeave={this.dragLeave.bind(this)}
        onDrop={this.drop.bind(this)}
      >
        <div className="title">Split</div>
        <div className="items" ref="items">
          {splitItems}
          {dragGhostArrow}
          {dragGhostElement}
        </div>
        {this.renderMenu()}
      </div>
    `);
  }
}
