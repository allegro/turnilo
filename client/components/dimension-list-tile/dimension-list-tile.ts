'use strict';

import * as React from 'react/addons';
import { $, Expression, Dispatcher, Dataset } from 'plywood';
import { TITLE_HEIGHT } from '../../config/constants';
import { Clicker, DataSource, Filter, Dimension, Measure } from '../../models/index';
import { moveInList } from '../../utils/general';
import { dataTransferTypesContain, setDragGhost } from '../../utils/dom';

const ITEM_HEIGHT = 30;

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
      dragPosition: Math.min(Math.max(0, Math.round(offset / ITEM_HEIGHT)), numItems)
    });
  }

  dragStart(dimension: Dimension, e: DragEvent) {
    var dataTransfer = e.dataTransfer;
    dataTransfer.effectAllowed = 'linkMove'; // Alt: set this to just 'move'
    dataTransfer.setData("text/url-list", 'http://imply.io'); // ToDo: make this generate a real URL
    dataTransfer.setData("text/plain", 'http://imply.io');
    dataTransfer.setData("text/dimension", dimension.name);

    setDragGhost(dataTransfer, dimension.title);
  }

  canDrop(e: DragEvent) {
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
        if (dragOver && dragPosition === i) itemY += ITEM_HEIGHT;
        var style = { transform: `translate3d(0,${itemY}px,0)` };
        itemY += ITEM_HEIGHT;
        var iconText = dimension.type === 'TIME' ? 'Ti' : 'Ab';

        var classNames = [
          'dimension',
          dimension.className
        ];
        if (dimension === selectedDimension) classNames.push('selected');
        return JSX(`
          <div
            className={classNames.join(' ')}
            key={dimension.name}
            draggable="true"
            onClick={this.selectDimension.bind(this, dimension)}
            onDragStart={this.dragStart.bind(this, dimension)}
            style={style}
          >
            <div className="icon">{iconText}</div>
            {dimension.title}
          </div>
        `);
      }, this);
      if (dragOver && dragPosition === dataSource.dimensions.size) itemY += ITEM_HEIGHT;
    }

    const style = {
      maxHeight: TITLE_HEIGHT + itemY
    };

    return JSX(`
      <div
        className={'dimension-list-tile ' + (dragOver ? 'drag-over' : 'no-drag')}
        style={style}
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
