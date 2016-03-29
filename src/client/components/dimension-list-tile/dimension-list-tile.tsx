require('./dimension-list-tile.css');

import * as React from 'react';
import { SvgIcon } from '../svg-icon/svg-icon';
import { STRINGS, TITLE_HEIGHT, DIMENSION_HEIGHT } from '../../config/constants';
import { DragManager } from '../../utils/drag-manager/drag-manager';
import { findParentWithClass, setDragGhost, transformStyle, classNames } from '../../utils/dom/dom';
import { Stage, Clicker, Essence, VisStrategy, Dimension, SplitCombine } from '../../../common/models/index';
import { PreviewMenu } from '../preview-menu/preview-menu';
import { TileHeader, TileHeaderIcon } from '../tile-header/tile-header';

const DIMENSION_CLASS_NAME = 'dimension';

export interface DimensionListTileProps extends React.Props<any> {
  clicker: Clicker;
  essence: Essence;
  menuStage: Stage;
  triggerFilterMenu: Function;
  triggerSplitMenu: Function;
  getUrlPrefix?: Function;
}

export interface DimensionListTileState {
  PreviewMenuAsync?: typeof PreviewMenu;
  menuOpenOn?: Element;
  menuDimension?: Dimension;
  highlightDimension?: Dimension;
}

export class DimensionListTile extends React.Component<DimensionListTileProps, DimensionListTileState> {
  private dragCounter: number;

  constructor() {
    super();
    this.state = {
      PreviewMenuAsync: null,
      menuOpenOn: null,
      menuDimension: null,
      highlightDimension: null
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

  dragStart(dimension: Dimension, e: DragEvent) {
    var { essence, getUrlPrefix } = this.props;

    var dataTransfer = e.dataTransfer;
    dataTransfer.effectAllowed = 'all';

    if (getUrlPrefix) {
      var newUrl = essence.changeSplit(SplitCombine.fromExpression(dimension.expression), VisStrategy.FairGame).getURL(getUrlPrefix());
      dataTransfer.setData("text/url-list", newUrl);
      dataTransfer.setData("text/plain", newUrl);
    }

    DragManager.setDragDimension(dimension);
    setDragGhost(dataTransfer, dimension.title);

    this.closeMenu();
  }

  onMouseOver(dimension: Dimension) {
    var { highlightDimension } = this.state;
    if (highlightDimension === dimension) return;
    this.setState({
      highlightDimension: dimension
    });
  }

  onMouseLeave(dimension: Dimension) {
    var { highlightDimension } = this.state;
    if (highlightDimension !== dimension) return;
    this.setState({
      highlightDimension: null
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
    var { menuDimension, highlightDimension } = this.state;
    var { dataSource } = essence;

    var itemY = 0;
    var dimensionItems = dataSource.dimensions.toArray().map((dimension, i) => {
      var style = transformStyle(0, itemY);
      itemY += DIMENSION_HEIGHT;

      var className = classNames(
        DIMENSION_CLASS_NAME,
        'type-' + dimension.className,
        {
          highlight: dimension === highlightDimension,
          selected: dimension === menuDimension
        }
      );

      return <div
        className={className}
        key={dimension.name}
        onClick={this.clickDimension.bind(this, dimension)}
        onMouseOver={this.onMouseOver.bind(this, dimension)}
        onMouseLeave={this.onMouseLeave.bind(this, dimension)}
        draggable={true}
        onDragStart={this.dragStart.bind(this, dimension)}
        style={style}
      >
        <div className="icon">
          <SvgIcon svg={require('../../icons/dim-' + dimension.className + '.svg')}/>
        </div>
        <div className="item-title">{dimension.title}</div>
      </div>;
    }, this);

    const style = {
      flex: dimensionItems.length + 2
    };

    var icons: TileHeaderIcon[] = [
      //{ name: 'more', onClick: null, svg: require('../../icons/full-more-mini.svg') }
      //{ name: 'search', onClick: null, svg: require('../../icons/full-search.svg') }
    ];

    return <div
      className="dimension-list-tile"
      style={style}
    >
      <TileHeader
        title={STRINGS.dimensions}
        icons={icons}
      />
      <div className="items" ref="items">
        {dimensionItems}
      </div>
      {this.renderMenu()}
    </div>;
  }
}
