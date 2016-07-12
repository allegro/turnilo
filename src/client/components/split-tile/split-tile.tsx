/*
 * Copyright 2015-2016 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

require('./split-tile.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Q from 'q';

import { SvgIcon } from '../svg-icon/svg-icon';
import { STRINGS, CORE_ITEM_WIDTH, CORE_ITEM_GAP } from '../../config/constants';
import { Stage, Clicker, Essence, VisStrategy, DataSource, Filter, SplitCombine, Dimension, DragPosition } from '../../../common/models/index';
import {
  findParentWithClass, setDragGhost, transformStyle, getXFromEvent, isInside, uniqueId,
  classNames
} from '../../utils/dom/dom';
import { getMaxItems, SECTION_WIDTH } from '../../utils/pill-tile/pill-tile';

import { DragManager } from '../../utils/drag-manager/drag-manager';
import { FancyDragIndicator } from '../fancy-drag-indicator/fancy-drag-indicator';
import { SplitMenu } from '../split-menu/split-menu';
import { BubbleMenu } from '../bubble-menu/bubble-menu';

const SPLIT_CLASS_NAME = 'split';

export interface SplitTileProps extends React.Props<any> {
  clicker: Clicker;
  essence: Essence;
  menuStage: Stage;
  getUrlPrefix?: () => string;
}

export interface SplitTileState {
  SplitMenuAsync?: typeof SplitMenu;
  menuOpenOn?: Element;
  menuDimension?: Dimension;
  menuSplit?: SplitCombine;
  dragPosition?: DragPosition;
  overflowMenuOpenOn?: Element;
  maxItems?: number;
  menuInside?: Element;
}

export class SplitTile extends React.Component<SplitTileProps, SplitTileState> {
  private overflowMenuId: string;
  private overflowMenuDeferred: Q.Deferred<Element>;

  constructor() {
    super();
    this.overflowMenuId = uniqueId('overflow-menu-');
    this.state = {
      SplitMenuAsync: null,
      menuOpenOn: null,
      menuDimension: null,
      dragPosition: null,
      maxItems: null
    };
  }

  componentDidMount() {
    require.ensure(['../split-menu/split-menu'], (require) => {
      this.setState({
        SplitMenuAsync: require('../split-menu/split-menu').SplitMenu
      });
    }, 'split-menu');
  }

  componentWillReceiveProps(nextProps: SplitTileProps) {
    const { menuStage, essence } = nextProps;
    var { splits } = essence;

    if (menuStage) {
      var newMaxItems = getMaxItems(menuStage.width, splits.toArray().length);
      if (newMaxItems !== this.state.maxItems) {
        this.setState({
          menuOpenOn: null,
          menuDimension: null,
          overflowMenuOpenOn: null,
          maxItems: newMaxItems
        });
      }
    }

  }

  componentDidUpdate() {
    var { overflowMenuOpenOn } = this.state;

    if (overflowMenuOpenOn) {
      var overflowMenu = this.getOverflowMenu();
      if (overflowMenu) this.overflowMenuDeferred.resolve(overflowMenu);
    }
  }

  selectDimensionSplit(dimension: Dimension, split: SplitCombine, e: MouseEvent) {
    var target = findParentWithClass(e.target as Element, SPLIT_CLASS_NAME);
    this.openMenu(dimension, split, target);
  }

  openMenu(dimension: Dimension, split: SplitCombine, target: Element) {
    var { menuOpenOn } = this.state;
    if (menuOpenOn === target) {
      this.closeMenu();
      return;
    }

    var overflowMenu = this.getOverflowMenu();
    var menuInside: Element = null;
    if (overflowMenu && isInside(target, overflowMenu)) {
      menuInside = overflowMenu;
    }

    this.setState({
      menuOpenOn: target,
      menuDimension: dimension,
      menuSplit: split,
      menuInside
    });
  }

  closeMenu() {
    var { menuOpenOn } = this.state;
    if (!menuOpenOn) return;
    this.setState({
      menuOpenOn: null,
      menuDimension: null,
      menuInside: null,
      menuSplit: null
    });
  }

  getOverflowMenu(): Element {
    return document.getElementById(this.overflowMenuId);
  }

  openOverflowMenu(target: Element): Q.Promise<any> {
    if (!target) return;
    var { overflowMenuOpenOn } = this.state;

    if (overflowMenuOpenOn === target) {
      this.closeOverflowMenu();
      return;
    }

    this.overflowMenuDeferred = Q.defer() as Q.Deferred<Element>;
    this.setState({ overflowMenuOpenOn: target });
    return this.overflowMenuDeferred.promise;
  }

  closeOverflowMenu() {
    var { overflowMenuOpenOn } = this.state;
    if (!overflowMenuOpenOn) return;
    this.setState({
      overflowMenuOpenOn: null
    });
  }

  removeSplit(split: SplitCombine, e: MouseEvent) {
    var { clicker } = this.props;
    clicker.removeSplit(split, VisStrategy.FairGame);
    this.closeMenu();
    this.closeOverflowMenu();
    e.stopPropagation();
  }

  dragStart(dimension: Dimension, split: SplitCombine, splitIndex: number, e: DragEvent) {
    var { essence, getUrlPrefix } = this.props;

    var dataTransfer = e.dataTransfer;
    dataTransfer.effectAllowed = 'all';

    if (getUrlPrefix) {
      var newUrl = essence.changeSplit(SplitCombine.fromExpression(dimension.expression), VisStrategy.FairGame).getURL(getUrlPrefix());
      dataTransfer.setData("text/url-list", newUrl);
      dataTransfer.setData("text/plain", newUrl);
    }

    DragManager.setDragSplit(split, 'filter-tile');
    DragManager.setDragDimension(dimension, 'filter-tile');
    setDragGhost(dataTransfer, dimension.title);

    this.closeMenu();
    this.closeOverflowMenu();
  }

  calculateDragPosition(e: DragEvent): DragPosition {
    const { essence } = this.props;
    var numItems = essence.splits.length();
    var rect = ReactDOM.findDOMNode(this.refs['items']).getBoundingClientRect();
    var x = getXFromEvent(e);
    var offset = x - rect.left;
    return DragPosition.calculateFromOffset(offset, numItems, CORE_ITEM_WIDTH, CORE_ITEM_GAP);
  }

  canDrop(e: DragEvent): boolean {
    return Boolean(DragManager.getDragSplit() || DragManager.getDragDimension());
  }

  dragEnter(e: DragEvent) {
    if (!this.canDrop(e)) return;
    e.preventDefault();
    this.setState({
      dragPosition: this.calculateDragPosition(e)
    });
  }

  dragOver(e: DragEvent) {
    if (!this.canDrop(e)) return;
    e.dataTransfer.dropEffect = 'move';
    e.preventDefault();
    var dragPosition = this.calculateDragPosition(e);
    if (dragPosition.equals(this.state.dragPosition)) return;
    this.setState({ dragPosition });
  }

  dragLeave(e: DragEvent) {
    if (!this.canDrop(e)) return;
    this.setState({
      dragPosition: null
    });
  }

  drop(e: DragEvent) {
    if (!this.canDrop(e)) return;
    e.preventDefault();
    var { clicker, essence } = this.props;
    var { maxItems } = this.state;

    var { splits } = essence;

    var newSplitCombine: SplitCombine = null;
    if (DragManager.getDragSplit()) {
      newSplitCombine = DragManager.getDragSplit();
    } else if (DragManager.getDragDimension()) {
      newSplitCombine = SplitCombine.fromExpression(DragManager.getDragDimension().expression);
    }

    if (newSplitCombine) {
      var dragPosition = this.calculateDragPosition(e);

      if (dragPosition.replace === maxItems) {
        dragPosition = new DragPosition({ insert: dragPosition.replace });
      }

      if (dragPosition.isReplace()) {
        clicker.changeSplits(splits.replaceByIndex(dragPosition.replace, newSplitCombine), VisStrategy.FairGame);
      } else {
        clicker.changeSplits(splits.insertByIndex(dragPosition.insert, newSplitCombine), VisStrategy.FairGame);
      }
    }

    this.setState({
      dragPosition: null
    });
  }

  // This will be called externally
  splitMenuRequest(dimension: Dimension) {
    var { splits } = this.props.essence;
    var split = splits.findSplitForDimension(dimension);
    if (!split) return;
    var targetRef = this.refs[dimension.name];
    if (!targetRef) return;
    var target = ReactDOM.findDOMNode(targetRef);
    if (!target) return;
    this.openMenu(dimension, split, target);
  }

  overflowButtonTarget(): Element {
    return ReactDOM.findDOMNode(this.refs['overflow']);
  }

  overflowButtonClick() {
    this.openOverflowMenu(this.overflowButtonTarget());
  };

  renderMenu(): JSX.Element {
    var { essence, clicker, menuStage } = this.props;
    var { SplitMenuAsync, menuOpenOn, menuDimension, menuSplit, menuInside, overflowMenuOpenOn } = this.state;
    if (!SplitMenuAsync || !menuDimension) return null;
    var onClose = this.closeMenu.bind(this);

    return <SplitMenuAsync
      clicker={clicker}
      essence={essence}
      containerStage={overflowMenuOpenOn ? null : menuStage}
      openOn={menuOpenOn}
      dimension={menuDimension}
      split={menuSplit}
      onClose={onClose}
      inside={menuInside}
    />;
  }

  renderOverflowMenu(items: SplitCombine[]): JSX.Element {
    var { overflowMenuOpenOn } = this.state;
    if (!overflowMenuOpenOn) return null;

    var segmentHeight = 29 + CORE_ITEM_GAP;

    var itemY = CORE_ITEM_GAP;
    var filterItems = items.map((item, i) => {
      var style = transformStyle(0, itemY);
      itemY += segmentHeight;
      return this.renderSplit(item, style, i);
    });

    return <BubbleMenu
      className="overflow-menu"
      id={this.overflowMenuId}
      direction="down"
      stage={Stage.fromSize(208, itemY)}
      fixedSize={true}
      openOn={overflowMenuOpenOn}
      onClose={this.closeOverflowMenu.bind(this)}
    >
      {filterItems}
    </BubbleMenu>;
  }

  renderOverflow(items: SplitCombine[], itemX: number): JSX.Element {
    var { essence } = this.props;
    var { dataSource } = essence;

    var style = transformStyle(itemX, 0);

    return <div
      className={classNames('overflow', { 'all-continuous': items.every(item => item.getDimension(dataSource.dimensions).isContinuous()) })}
      ref="overflow"
      key="overflow"
      style={style}
      onClick={this.overflowButtonClick.bind(this)}
    >
      <div className="count">{'+' + items.length}</div>
      {this.renderOverflowMenu(items)}
    </div>;
  }

  renderSplit(split: SplitCombine, style: React.CSSProperties, i: number) {
    var { essence } = this.props;
    var { menuDimension } = this.state;
    var { dataSource } = essence;

    var dimension = split.getDimension(dataSource.dimensions);
    if (!dimension) throw new Error('dimension not found');
    var dimensionName = dimension.name;

    var classNames = [
      SPLIT_CLASS_NAME,
      'type-' + dimension.className
    ];
    if (dimension === menuDimension) classNames.push('selected');
    return <div
      className={classNames.join(' ')}
      key={split.toKey()}
      ref={dimensionName}
      draggable={true}
      onClick={this.selectDimensionSplit.bind(this, dimension, split)}
      onDragStart={this.dragStart.bind(this, dimension, split, i)}
      style={style}
    >
      <div className="reading">{split.getTitle(dataSource.dimensions)}</div>
      <div className="remove" onClick={this.removeSplit.bind(this, split)}>
        <SvgIcon svg={require('../../icons/x.svg')}/>
      </div>
    </div>;
  }

  render() {
    var { essence } = this.props;
    var { dragPosition, maxItems } = this.state;
    var { splits } = essence;

    var splitsArray = splits.toArray();

    var itemX = 0;
    var splitItems = splitsArray.slice(0, maxItems).map((split, i) => {
      var style = transformStyle(itemX, 0);
      itemX += SECTION_WIDTH;
      return this.renderSplit(split, style, i);
    }, this);

    var overflowItems = splitsArray.slice(maxItems);
    if (overflowItems.length > 0) {
      var overFlowStart = splitItems.length * SECTION_WIDTH;
      splitItems.push(this.renderOverflow(overflowItems, overFlowStart));
    }

    return <div
      className="split-tile"
      onDragEnter={this.dragEnter.bind(this)}
    >
      <div className="title">{STRINGS.split}</div>
      <div className="items" ref="items">
        {splitItems}
      </div>
      {dragPosition ? <FancyDragIndicator dragPosition={dragPosition}/> : null}
      {dragPosition ? <div
        className="drag-mask"
        onDragOver={this.dragOver.bind(this)}
        onDragLeave={this.dragLeave.bind(this)}
        onDragExit={this.dragLeave.bind(this)}
        onDrop={this.drop.bind(this)}
      /> : null}
      {this.renderMenu()}
    </div>;
  }
}
