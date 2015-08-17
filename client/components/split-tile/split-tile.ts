'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { $, Expression, Dispatcher, Dataset } from 'plywood';
import { CORE_ITEM_HEIGHT, CORE_ITEM_GAP } from '../../config/constants';
import { Clicker, DataSource, Filter, SplitCombine, Dimension, Measure } from '../../models/index';
import { dataTransferTypesContain, setDragGhost } from '../../utils/dom';

interface SplitTileProps {
  clicker: Clicker;
  dataSource: DataSource;
  splits: List<SplitCombine>;
  selectedDimension: Dimension;
  triggerMenuOpen: (target: Element, dimension: Dimension) => void;
}

interface SplitTileState {
  dragOver?: boolean;
  dragPosition?: number;
}

export class SplitTile extends React.Component<SplitTileProps, SplitTileState> {
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

  componentWillReceiveProps(nextProps: SplitTileProps) {

  }

  selectDimension(dimension: Dimension, e: MouseEvent) {
    var { triggerMenuOpen } = this.props;
    triggerMenuOpen(<Element>e.target, dimension);
  }

  removeSplit(split: SplitCombine, e: MouseEvent) {
    var { clicker } = this.props;
    clicker.removeSplit(split);
    e.stopPropagation();
  }

  dragStart(dimension: Dimension, e: DragEvent) {
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

    var dimension = dataSource.getDimension(e.dataTransfer.getData("text/dimension"));
    clicker.addSplit(dimension.getSplitCombine());

    this.dragCounter = 0;
    this.setState({
      dragOver: false,
      dragPosition: null
    });
  }

  render() {
    var { dataSource, selectedDimension, splits } = this.props;
    var { dragOver, dragPosition } = this.state;

    var itemY = 0;
    var splitItems: Array<React.ReactElement<any>> = null;
    if (dataSource.metadataLoaded) {
      splitItems = splits.toArray().map((split, i) => {
        var dimension = dataSource.getDimension(split.dimension);
        if (!dimension) throw new Error('dimension not found');

        if (i) itemY += CORE_ITEM_GAP;
        if (dragOver && dragPosition === i) itemY += CORE_ITEM_HEIGHT;
        var style = { transform: `translate3d(0,${itemY}px,0)` };
        itemY += CORE_ITEM_HEIGHT;

        var classNames = [
          'split',
          dimension.className
        ];
        if (dimension === selectedDimension) classNames.push('selected');
        return JSX(`
          <div
            className={classNames.join(' ')}
            key={dimension.name}
            draggable="true"
            onClick={this.selectDimension.bind(this, dimension)}
            onDragStart={this.dragStart.bind(this, dimension, split)}
            style={style}
          >
            <div className="reading">{dimension.title}</div>
            <div className="remove" onClick={this.removeSplit.bind(this, split)}>
              <Icon name="x" width={12} height={12}/>
            </div>
          </div>
        `);
      }, this);
      if (dragOver && dragPosition === splits.size) itemY += CORE_ITEM_HEIGHT;
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
        <div className="items" ref="splitItems" style={{ height: itemY }}>
          {splitItems}
        </div>
      </div>
    `);
  }
}
