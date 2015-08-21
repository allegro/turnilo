'use strict';

import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { $, Expression, Executor, Dataset } from 'plywood';
import { TITLE_HEIGHT, CORE_ITEM_HEIGHT } from '../../config/constants';
import { Clicker, DataSource, Filter, Dimension, Measure } from '../../models/index';
import { moveInList } from '../../utils/general';
import { dataTransferTypesContain, setDragGhost } from '../../utils/dom';

interface DimensionListTileProps {
  clicker: Clicker;
  dataSource: DataSource;
  selectedDimension: Dimension;
  triggerMenuOpen: (target: Element, dimension: Dimension) => void;
}

interface DimensionListTileState {
  dragOver?: boolean;
  dragPosition?: number;
}

export class DimensionListTile extends React.Component<DimensionListTileProps, DimensionListTileState> {
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

  componentWillReceiveProps(nextProps: DimensionListTileProps) {

  }

  selectDimension(dimension: Dimension, e: MouseEvent) {
    var { triggerMenuOpen } = this.props;
    triggerMenuOpen(<Element>e.target, dimension);
  }

  calculateDragPosition(e: DragEvent) {
    var numItems = this.props.dataSource.dimensions.size;
    var rect = React.findDOMNode(this.refs['items']).getBoundingClientRect();
    var offset = e.clientY - rect.top;

    this.setState({
      dragPosition: Math.min(Math.max(0, Math.round(offset / CORE_ITEM_HEIGHT)), numItems)
    });
  }

  dragStart(dimension: Dimension, e: DragEvent) {
    var dataTransfer = e.dataTransfer;
    dataTransfer.effectAllowed = 'all';
    dataTransfer.setData("text/url-list", 'http://imply.io');
    dataTransfer.setData("text/plain", 'http://imply.io');
    dataTransfer.setData("text/dimension", dimension.name);
    setDragGhost(dataTransfer, dimension.title);
  }

  iconDragStart(dimension: Dimension, e: DragEvent) {
    e.stopPropagation();
    var dataTransfer = e.dataTransfer;
    dataTransfer.effectAllowed = 'move';
    dataTransfer.setData("text/dimension", dimension.name);
    setDragGhost(dataTransfer, dimension.title);
  }

  canDrop(e: DragEvent): boolean {
    var { dataTransfer } = e;
    return dataTransfer.effectAllowed === 'move' && dataTransferTypesContain(dataTransfer.types, "text/dimension");
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

    var dimensions = dataSource.dimensions;
    var dimensionName = dimension.name;
    var index = dimensions.findIndex((d) => d.name === dimensionName);
    if (index !== -1 && index !== dragPosition) {
      clicker.changeDataSource(dataSource.changeDimensions(moveInList(dimensions, index, dragPosition)));
    }

    this.dragCounter = 0;
    this.setState({
      dragSection: null,
      dragPosition: null
    });
  }

  render() {
    var { dataSource, selectedDimension } = this.props;
    var { dragOver, dragPosition } = this.state;

    var itemY = 0;
    var dimensionItems: Array<React.ReactElement<any>> = null;
    if (dataSource.metadataLoaded) {
      dimensionItems = dataSource.dimensions.toArray().map((dimension, i) => {
        if (dragOver && dragPosition === i) itemY += CORE_ITEM_HEIGHT;
        var style = { transform: `translate3d(0,${itemY}px,0)` };
        itemY += CORE_ITEM_HEIGHT;

        var classNames = [
          'dimension',
          dimension.className
        ];
        if (dimension === selectedDimension) classNames.push('selected');
        return JSX(`
          <div
            className={classNames.join(' ')}
            key={dimension.name}
            onClick={this.selectDimension.bind(this, dimension)}
            draggable="true"
            onDragStart={this.dragStart.bind(this, dimension)}
            style={style}
          >
            <div className="icon" draggable="true" onDragStart={this.iconDragStart.bind(this, dimension)}>
              <Icon name={dimension.className}/>
            </div>
            <div className="item-title">{dimension.title}</div>
          </div>
        `);
      }, this);
      if (dragOver && dragPosition === dataSource.dimensions.size) itemY += CORE_ITEM_HEIGHT;
    }

    return JSX(`
      <div
        className={'dimension-list-tile ' + (dragOver ? 'drag-over' : 'no-drag')}
        onDragOver={this.dragOver.bind(this)}
        onDragEnter={this.dragEnter.bind(this)}
        onDragLeave={this.dragLeave.bind(this)}
        onDrop={this.drop.bind(this)}
      >
        <div className="title">Dimensions</div>
        <div className="items" ref="items">
          {dimensionItems}
        </div>
      </div>
    `);
  }
}
