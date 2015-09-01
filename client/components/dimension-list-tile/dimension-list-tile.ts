'use strict';

import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { List } from 'immutable';
import { $, Expression, Executor, Dataset } from 'plywood';
import { TITLE_HEIGHT, DIMENSION_HEIGHT } from '../../config/constants';
import { moveInList } from '../../utils/general';
import { findParentWithClass, dataTransferTypesContain, setDragGhost } from '../../utils/dom';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure } from '../../models/index';
import { PreviewMenu } from '../preview-menu/preview-menu';

const DIMENSION_CLASS_NAME = 'dimension';

interface DimensionListTileProps {
  clicker: Clicker;
  essence: Essence;
  menuStage: Stage;
}

interface DimensionListTileState {
  menuOpenOn?: Element;
  menuDimension?: Dimension;
  dragOver?: boolean;
  dragPosition?: number;
}

export class DimensionListTile extends React.Component<DimensionListTileProps, DimensionListTileState> {
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
    var target = findParentWithClass(<Element>e.target, DIMENSION_CLASS_NAME);
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

  calculateDragPosition(e: DragEvent) {
    var { essence } = this.props;
    var numItems = essence.dataSource.dimensions.size;
    var rect = React.findDOMNode(this.refs['items']).getBoundingClientRect();
    var offset = e.clientY - rect.top;

    this.setState({
      dragPosition: Math.min(Math.max(0, Math.round(offset / DIMENSION_HEIGHT)), numItems)
    });
  }

  dragStart(dimension: Dimension, e: DragEvent) {
    var { essence } = this.props;

    var newUrl = essence.changeSplit(dimension.getSplitCombine()).getURL();

    var dataTransfer = e.dataTransfer;
    dataTransfer.effectAllowed = 'all';
    dataTransfer.setData("text/url-list", newUrl);
    dataTransfer.setData("text/plain", newUrl);
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
    var { clicker, essence } = this.props;
    var { dragPosition } = this.state;
    var { dataSource } = essence;

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

  renderMenu(): React.ReactElement<any> {
    var { essence, clicker, menuStage } = this.props;
    var { menuOpenOn, menuDimension } = this.state;
    if (!menuDimension) return null;
    var onClose = this.closeMenu.bind(this);

    return JSX(`
      <PreviewMenu
        clicker={clicker}
        essence={essence}
        direction="right"
        containerStage={menuStage}
        openOn={menuOpenOn}
        dimension={menuDimension}
        onClose={onClose}
      />
    `);
  }

  render() {
    var { essence } = this.props;
    var { menuDimension, dragOver, dragPosition } = this.state;
    var { dataSource } = essence;

    var itemY = 0;
    var dimensionItems: Array<React.ReactElement<any>> = null;
    if (dataSource.metadataLoaded) {
      dimensionItems = dataSource.dimensions.toArray().map((dimension, i) => {
        if (dragOver && dragPosition === i) itemY += DIMENSION_HEIGHT;
        var style = { transform: `translate3d(0,${itemY}px,0)` };
        itemY += DIMENSION_HEIGHT;

        var classNames = [
          DIMENSION_CLASS_NAME,
          dimension.className
        ];
        if (dimension === menuDimension) classNames.push('selected');
        return JSX(`
          <div
            className={classNames.join(' ')}
            key={dimension.name}
            onClick={this.clickDimension.bind(this, dimension)}
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
      if (dragOver && dragPosition === dataSource.dimensions.size) itemY += DIMENSION_HEIGHT;
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
        {this.renderMenu()}
      </div>
    `);
  }
}
