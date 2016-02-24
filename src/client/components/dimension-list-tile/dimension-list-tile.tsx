require('./dimension-list-tile.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { List } from 'immutable';
import { $, Expression, Executor, Dataset } from 'plywood';
import { STRINGS, TITLE_HEIGHT, DIMENSION_HEIGHT } from '../../config/constants';
import { moveInList } from '../../../common/utils/general/general';
import { DragManager } from '../../utils/drag-manager/drag-manager';
import { findParentWithClass, setDragGhost, transformStyle } from '../../utils/dom/dom';
import { Stage, Clicker, Essence, VisStrategy, DataSource, Filter, Dimension, Measure, SplitCombine} from '../../../common/models/index';
import { PreviewMenu } from '../preview-menu/preview-menu';

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

      var classNames = [
        DIMENSION_CLASS_NAME,
        'type-' + dimension.className
      ];
      if (dimension === highlightDimension) classNames.push('highlight');
      if (dimension === menuDimension) classNames.push('selected');
      return <div
        className={classNames.join(' ')}
        key={dimension.name}
        onClick={this.clickDimension.bind(this, dimension)}
        onMouseOver={this.onMouseOver.bind(this, dimension)}
        onMouseLeave={this.onMouseLeave.bind(this, dimension)}
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

    const style = {
      flex: dimensionItems.length + 2
    };

    return <div
      className="dimension-list-tile"
      style={style}
    >
      <div className="title">{STRINGS.dimensions}</div>
      <div className="items" ref="items">
        {dimensionItems}
      </div>
      {this.renderMenu()}
    </div>;
  }
}
