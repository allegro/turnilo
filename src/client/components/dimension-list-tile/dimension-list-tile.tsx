'use strict';
require('./dimension-list-tile.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { List } from 'immutable';
import { $, Expression, Executor, Dataset } from 'plywood';
import { TITLE_HEIGHT, DIMENSION_HEIGHT } from '../../config/constants';
import { moveInList } from '../../../common/utils/general/general';
import { findParentWithClass, dataTransferTypesGet, setDragGhost, transformStyle } from '../../utils/dom/dom';
import { Stage, Clicker, Essence, VisStrategy, DataSource, Filter, Dimension, Measure, SplitCombine } from '../../../common/models/index';
import { PreviewMenu } from '../preview-menu/preview-menu';

const DIMENSION_CLASS_NAME = 'dimension';

export interface DimensionListTileProps extends React.Props<any> {
  clicker: Clicker;
  essence: Essence;
  menuStage: Stage;
  triggerFilterMenu: Function;
  triggerSplitMenu: Function;
}

export interface DimensionListTileState {
  PreviewMenuAsync?: typeof PreviewMenu;
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
      PreviewMenuAsync: null,
      menuOpenOn: null,
      menuDimension: null,
      dragOver: false,
      dragPosition: null
    };
  }

  componentDidMount() {
    require.ensure(['../preview-menu/preview-menu'], (require) => {
      this.setState({
        PreviewMenuAsync: require('../preview-menu/preview-menu').PreviewMenu
      });
    }, 'preview-menu');
  }

  clickDimension(dimension: Dimension, e: MouseEvent) {
    var { menuOpenOn } = this.state;
    var target = findParentWithClass(e.target as Element, DIMENSION_CLASS_NAME);
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
    var { menuOpenOn } = this.state;
    if (!menuOpenOn) return;
    this.setState({
      menuOpenOn: null,
      menuDimension: null
    });
  }

  calculateDragPosition(e: DragEvent) {
    var { essence } = this.props;
    var numItems = essence.dataSource.dimensions.size;
    var rect = ReactDOM.findDOMNode(this.refs['items']).getBoundingClientRect();
    var offset = e.clientY - rect.top;

    this.setState({
      dragPosition: Math.min(Math.max(0, Math.round(offset / DIMENSION_HEIGHT)), numItems)
    });
  }

  dragStart(dimension: Dimension, e: DragEvent) {
    var { essence } = this.props;

    var newUrl = essence.changeSplit(SplitCombine.fromExpression(dimension.expression), VisStrategy.FairGame).getURL();

    var dataTransfer = e.dataTransfer;
    dataTransfer.effectAllowed = 'all';
    dataTransfer.setData("text/url-list", newUrl);
    dataTransfer.setData("text/plain", newUrl);
    dataTransfer.setData("dimension/" + dimension.name, JSON.stringify(dimension));
    setDragGhost(dataTransfer, dimension.title);

    this.closeMenu();
  }

  canDrop(e: DragEvent): boolean {
    var { dataTransfer } = e;
    return dataTransfer.effectAllowed === 'move' && Boolean(dataTransferTypesGet(dataTransfer.types, "dimension"));
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
    e.preventDefault();
    var { clicker, essence } = this.props;
    var { dragPosition } = this.state;
    var { dataSource } = essence;

    var dimensionName = dataTransferTypesGet(e.dataTransfer.types, "dimension");
    if (dimensionName) {
      var dimension = dataSource.getDimension(dimensionName);
      var dimensions = dataSource.dimensions;
      var index = dimensions.findIndex((d) => d.name === dimensionName);
      if (index !== -1 && index !== dragPosition) {
        clicker.changeDataSource(dataSource.changeDimensions(moveInList(dimensions, index, dragPosition)));
      }
    }

    this.dragCounter = 0;
    this.setState({
      dragPosition: null
    });
  }

  renderMenu(): JSX.Element {
    var { essence, clicker, menuStage, triggerFilterMenu, triggerSplitMenu } = this.props;
    var { PreviewMenuAsync, menuOpenOn, menuDimension } = this.state;
    if (!PreviewMenuAsync || !menuDimension) return null;
    var onClose = this.closeMenu.bind(this);

    return <PreviewMenuAsync
      clicker={clicker}
      essence={essence}
      direction="right"
      containerStage={menuStage}
      openOn={menuOpenOn}
      dimension={menuDimension}
      triggerFilterMenu={triggerFilterMenu}
      triggerSplitMenu={triggerSplitMenu}
      onClose={onClose}
    />;
  }

  render() {
    var { essence } = this.props;
    var { menuDimension, dragOver, dragPosition } = this.state;
    var { dataSource } = essence;

    var itemY = 0;
    var dimensionItems = dataSource.dimensions.toArray().map((dimension, i) => {
      if (dragOver && dragPosition === i) itemY += DIMENSION_HEIGHT;
      var style = transformStyle(0, itemY);
      itemY += DIMENSION_HEIGHT;

      var classNames = [
        DIMENSION_CLASS_NAME,
        'type-' + dimension.className
      ];
      if (dimension === menuDimension) classNames.push('selected');
      return <div
        className={classNames.join(' ')}
        key={dimension.name}
        onClick={this.clickDimension.bind(this, dimension)}
        draggable={true}
        onDragStart={this.dragStart.bind(this, dimension)}
        style={style}
      >
        <div className="icon">
          <SvgIcon svg={require('../../icons/type-' + dimension.className + '.svg')}/>
        </div>
        <div className="item-title">{dimension.title}</div>
      </div>;
    }, this);
    if (dragOver && dragPosition === dataSource.dimensions.size) itemY += DIMENSION_HEIGHT;

    const style = {
      flex: dimensionItems.length + 2
    };

    return <div
      className={'dimension-list-tile ' + (dragOver ? 'drag-over' : 'no-drag')}
      onDragOver={this.dragOver.bind(this)}
      onDragEnter={this.dragEnter.bind(this)}
      onDragLeave={this.dragLeave.bind(this)}
      onDrop={this.drop.bind(this)}
      style={style}
    >
      <div className="title">Dimensions</div>
      <div className="items" ref="items">
        {dimensionItems}
      </div>
      {this.renderMenu()}
    </div>;
  }
}
