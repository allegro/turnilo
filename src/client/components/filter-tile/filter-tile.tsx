require('./filter-tile.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Q from 'q';
import { Timezone, Duration, hour, day, week } from 'chronoshift';
import { STRINGS, BAR_TITLE_WIDTH, CORE_ITEM_WIDTH, CORE_ITEM_GAP } from '../../config/constants';
import { Stage, Clicker, Essence, DataSource, Filter, FilterClause, Dimension, DragPosition } from '../../../common/models/index';
import { formatLabel } from '../../../common/utils/formatter/formatter';
import {
  findParentWithClass, setDragGhost, uniqueId, isInside, transformStyle, getXFromEvent,
  classNames
} from '../../utils/dom/dom';
import { DragManager } from '../../utils/drag-manager/drag-manager';

import { SvgIcon } from '../svg-icon/svg-icon';
import { FancyDragIndicator } from '../fancy-drag-indicator/fancy-drag-indicator';
import { FilterMenu } from '../filter-menu/filter-menu';
import { BubbleMenu } from '../bubble-menu/bubble-menu';

const FILTER_CLASS_NAME = 'filter';
const ANIMATION_DURATION = 400;
const OVERFLOW_WIDTH = 40;

export interface ItemBlank {
  dimension: Dimension;
  source: string;
  clause?: FilterClause;
}

function formatLabelDummy(dimension: Dimension): string {
  return dimension.title;
}

export interface FilterTileProps extends React.Props<any> {
  clicker: Clicker;
  essence: Essence;
  menuStage: Stage;
  getUrlPrefix?: () => string;
}

export interface FilterTileState {
  FilterMenuAsync?: typeof FilterMenu;
  menuOpenOn?: Element;
  menuDimension?: Dimension;
  menuInside?: Element;
  overflowMenuOpenOn?: Element;
  dragPosition?: DragPosition;
  possibleDimension?: Dimension;
  possiblePosition?: DragPosition;
  maxItems?: number;
}

export class FilterTile extends React.Component<FilterTileProps, FilterTileState> {
  private overflowMenuId: string;
  private dummyDeferred: Q.Deferred<any>;
  private overflowMenuDeferred: Q.Deferred<Element>;

  constructor() {
    super();
    this.overflowMenuId = uniqueId('overflow-menu-');
    this.state = {
      FilterMenuAsync: null,
      menuOpenOn: null,
      menuDimension: null,
      menuInside: null,
      overflowMenuOpenOn: null,
      dragPosition: null,
      possibleDimension: null,
      possiblePosition: null,
      maxItems: 20
    };
  }

  componentDidMount() {
    require.ensure(['../filter-menu/filter-menu'], (require) => {
      this.setState({
        FilterMenuAsync: require('../filter-menu/filter-menu').FilterMenu
      });
    }, 'filter-menu');
  }

  componentWillReceiveProps(nextProps: FilterTileProps) {
    const { menuStage } = nextProps;
    const sectionWidth = CORE_ITEM_WIDTH + CORE_ITEM_GAP;

    if (menuStage) {
      var newMaxItems = Math.floor((menuStage.width - BAR_TITLE_WIDTH - OVERFLOW_WIDTH - 79 + CORE_ITEM_GAP) / sectionWidth); // 79 = vis selector width
      if (newMaxItems !== this.state.maxItems) {
        this.setState({
          menuOpenOn: null,
          menuDimension: null,
          menuInside: null,
          possibleDimension: null,
          possiblePosition: null,
          overflowMenuOpenOn: null,
          maxItems: newMaxItems
        });
      }
    }
  }

  componentDidUpdate() {
    var { possibleDimension, overflowMenuOpenOn } = this.state;

    if (possibleDimension) {
      this.dummyDeferred.resolve(null);
    }

    if (overflowMenuOpenOn) {
      var overflowMenu = this.getOverflowMenu();
      if (overflowMenu) this.overflowMenuDeferred.resolve(overflowMenu);
    }
  }

  overflowButtonTarget(): Element {
    return ReactDOM.findDOMNode(this.refs['overflow']);
  }

  getOverflowMenu(): Element {
    return document.getElementById(this.overflowMenuId);
  }

  clickDimension(dimension: Dimension, e: React.MouseEvent) {
    var target = findParentWithClass(e.target as Element, FILTER_CLASS_NAME);
    this.openMenu(dimension, target);
  }

  openMenuOnDimension(dimension: Dimension) {
    var targetRef = this.refs[dimension.name];
    if (targetRef) {
      var target = ReactDOM.findDOMNode(targetRef);
      if (!target) return;
      this.openMenu(dimension, target);
    } else {
      var overflowButtonTarget = this.overflowButtonTarget();
      if (overflowButtonTarget) {
        this.openOverflowMenu(overflowButtonTarget).then(() => {
          var target = ReactDOM.findDOMNode(this.refs[dimension.name]);
          if (!target) return;
          this.openMenu(dimension, target);
        });
      }
    }
  }

  openMenu(dimension: Dimension, target: Element) {
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
      menuInside
    });
  }

  closeMenu() {
    var { menuOpenOn, possibleDimension } = this.state;
    if (!menuOpenOn) return;
    var newState: FilterTileState = {
      menuOpenOn: null,
      menuDimension: null,
      menuInside: null,
      possibleDimension: null,
      possiblePosition: null
    };
    if (possibleDimension) {
      // If we are adding a ghost dimension also close the overflow menu
      // This is so it does not remain phantom open with nothing inside
      newState.overflowMenuOpenOn = null;
    }
    this.setState(newState);
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

  removeFilter(itemBlank: ItemBlank, e: MouseEvent) {
    var { essence, clicker } = this.props;
    if (itemBlank.clause) {
      if (itemBlank.source === 'from-highlight') {
        clicker.dropHighlight();
      } else {
        clicker.changeFilter(essence.filter.remove(itemBlank.clause.expression));
      }
    }
    this.closeMenu();
    this.closeOverflowMenu();
    e.stopPropagation();
  }

  dragStart(dimension: Dimension, clause: FilterClause, e: DragEvent) {
    var { essence, getUrlPrefix } = this.props;

    var dataTransfer = e.dataTransfer;
    dataTransfer.effectAllowed = 'all';

    if (getUrlPrefix) {
      var newUrl = essence.getURL(getUrlPrefix());
      dataTransfer.setData("text/url-list", newUrl);
      dataTransfer.setData("text/plain", newUrl);
    }

    DragManager.setDragDimension(dimension, 'filter-tile');

    setDragGhost(dataTransfer, dimension.title);

    this.closeMenu();
    this.closeOverflowMenu();
  }

  calculateDragPosition(e: DragEvent): DragPosition {
    var { essence } = this.props;
    var numItems = essence.filter.length();
    var rect = ReactDOM.findDOMNode(this.refs['items']).getBoundingClientRect();
    var offset = getXFromEvent(e) - rect.left;
    return DragPosition.calculateFromOffset(offset, numItems, CORE_ITEM_WIDTH, CORE_ITEM_GAP);
  }

  canDrop(e: DragEvent): boolean {
    return Boolean(DragManager.getDragDimension());
  }

  dragEnter(e: DragEvent) {
    if (!this.canDrop(e)) return;
    var dragPosition = this.calculateDragPosition(e);
    if (dragPosition.equals(this.state.dragPosition)) return;
    this.setState({ dragPosition });
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
    this.setState({ dragPosition: null });
  }

  drop(e: DragEvent) {
    if (!this.canDrop(e)) return;
    e.preventDefault();
    var { clicker, essence } = this.props;
    var { filter, dataSource } = essence;

    var newState: FilterTileState = {
      dragPosition: null
    };

    var dimension = DragManager.getDragDimension();
    if (dimension) {
      var dragPosition = this.calculateDragPosition(e);

      var tryingToReplaceTime = false;
      if (dragPosition.replace !== null) {
        var targetClause = filter.clauses.get(dragPosition.replace);
        tryingToReplaceTime = targetClause && targetClause.expression.equals(dataSource.timeAttribute);
      }

      var existingClause = filter.clauseForExpression(dimension.expression);
      if (existingClause) {
        var newFilter: Filter;
        if (dragPosition.isReplace()) {
          newFilter = filter.replaceByIndex(dragPosition.replace, existingClause);
        } else {
          newFilter = filter.insertByIndex(dragPosition.insert, existingClause);
        }

        var newFilterSame = filter.equals(newFilter);
        if (!newFilterSame) {
          clicker.changeFilter(newFilter);
        }

        if (DragManager.getDragOrigin() !== 'filter-tile') { // Do not open the menu if it is an internal re-arrange
          if (newFilterSame) {
            this.filterMenuRequest(dimension);
          } else {
            // Wait for the animation to finish to know where to open the menu
            setTimeout(() => {
              this.filterMenuRequest(dimension);
            }, ANIMATION_DURATION + 50);
          }
        }

      } else {
        if (dragPosition && !tryingToReplaceTime) {
          this.addDummy(dimension, dragPosition);
        }

      }
    }

    this.setState(newState);
  }

  addDummy(dimension: Dimension, possiblePosition: DragPosition) {
    this.dummyDeferred = Q.defer() as Q.Deferred<Element>;
    this.setState({
      possibleDimension: dimension,
      possiblePosition
    });
    this.dummyDeferred.promise.then(() => {
      this.openMenuOnDimension(dimension);
    });
  }

  // This will be called externally
  filterMenuRequest(dimension: Dimension) {
    var { filter } = this.props.essence;
    if (filter.filteredOn(dimension.expression)) {
      this.openMenuOnDimension(dimension);
    } else {
      this.addDummy(dimension, new DragPosition({ insert: filter.length() }));
    }
  }

  overflowButtonClick() {
    this.openOverflowMenu(this.overflowButtonTarget());
  };

  renderMenu(): JSX.Element {
    var { essence, clicker, menuStage } = this.props;
    var { FilterMenuAsync, menuOpenOn, menuDimension, menuInside, possiblePosition, maxItems, overflowMenuOpenOn } = this.state;
    if (!FilterMenuAsync || !menuDimension) return null;

    if (possiblePosition && possiblePosition.replace === maxItems) {
      possiblePosition = new DragPosition({ insert: possiblePosition.replace });
    }

    return <FilterMenuAsync
      clicker={clicker}
      essence={essence}
      direction="down"
      containerStage={overflowMenuOpenOn ? null : menuStage}
      openOn={menuOpenOn}
      dimension={menuDimension}
      changePosition={possiblePosition}
      onClose={this.closeMenu.bind(this)}
      inside={menuInside}
    />;
  }

  renderOverflowMenu(overflowItemBlanks: ItemBlank[]): JSX.Element {
    var { overflowMenuOpenOn } = this.state;
    if (!overflowMenuOpenOn) return null;

    var segmentHeight = 29 + CORE_ITEM_GAP;

    var itemY = CORE_ITEM_GAP;
    var filterItems = overflowItemBlanks.map((itemBlank) => {
      var style = transformStyle(0, itemY);
      itemY += segmentHeight;
      return this.renderItemBlank(itemBlank, style);
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

  renderOverflow(overflowItemBlanks: ItemBlank[]): JSX.Element {
    return <div
      className="overflow"
      ref="overflow"
      onClick={this.overflowButtonClick.bind(this)}
    >
      {'+' + overflowItemBlanks.length}
      {this.renderOverflowMenu(overflowItemBlanks)}
    </div>;
  }

  renderRemoveButton(itemBlank: ItemBlank) {
    var { essence } = this.props;
    var dataSource = essence.dataSource;
    if (itemBlank.dimension.expression.equals(dataSource.timeAttribute)) return null;
    return <div className="remove" onClick={this.removeFilter.bind(this, itemBlank)}>
      <SvgIcon svg={require('../../icons/x.svg')}/>
    </div>;
  }

  renderItemBlank(itemBlank: ItemBlank, style: any): JSX.Element {
    var { essence, clicker } = this.props;
    var { menuDimension } = this.state;
    var { timezone } = essence;

    var { dimension, clause, source } = itemBlank;
    var dimensionName = dimension.name;

    var classNames = [FILTER_CLASS_NAME, 'type-' + dimension.className, source];
    if (dimension === menuDimension) classNames.push('selected');

    var className = classNames.join(' ');

    if (source === 'from-highlight') {
      return <div
        className={className}
        key={dimensionName}
        ref={dimensionName}
        onClick={clicker.acceptHighlight.bind(clicker)}
        style={style}
      >
        <div className="reading">{formatLabel({dimension, clause, essence})}</div>
        {this.renderRemoveButton(itemBlank)}
      </div>;
    }

    if (clause) {
      return <div
        className={className}
        key={dimensionName}
        ref={dimensionName}
        draggable={true}
        onClick={this.clickDimension.bind(this, dimension)}
        onDragStart={this.dragStart.bind(this, dimension, clause)}
        style={style}
      >
        <div className="reading">{formatLabel({dimension, clause, essence})}</div>
        {this.renderRemoveButton(itemBlank)}
      </div>;
    } else {
      return <div
        className={className}
        key={dimensionName}
        ref={dimensionName}
        style={style}
      >
        <div className="reading">{formatLabelDummy(dimension)}</div>
        {this.renderRemoveButton(itemBlank)}
      </div>;
    }
  }

  render() {
    var { essence } = this.props;
    var { dragPosition, possibleDimension, possiblePosition, maxItems } = this.state;
    var { dataSource, filter, highlight } = essence;

    const sectionWidth = CORE_ITEM_WIDTH + CORE_ITEM_GAP;

    var itemBlanks = filter.clauses.toArray()
      .map((clause): ItemBlank => {
        var dimension = dataSource.getDimensionByExpression(clause.expression);
        if (!dimension) return null;
        return {
          dimension,
          source: 'from-filter',
          clause
        };
      })
      .filter(Boolean);

    if (highlight) {
      highlight.delta.clauses.forEach((clause) => {
        var added = false;
        itemBlanks = itemBlanks.map((blank) => {
          if (clause.expression.equals(blank.clause.expression)) {
            added = true;
            return {
              dimension: blank.dimension,
              source: 'from-highlight',
              clause
            };
          } else {
            return blank;
          }
        });
        if (!added) {
          var dimension = dataSource.getDimensionByExpression(clause.expression);
          if (dimension) {
            itemBlanks.push({
              dimension,
              source: 'from-highlight',
              clause
            });
          }
        }
      });
    }

    if (possibleDimension && possiblePosition) {
      var dummyBlank: ItemBlank = {
        dimension: possibleDimension,
        source: 'from-drag'
      };
      if (possiblePosition.replace === maxItems) {
        possiblePosition = new DragPosition({ insert: possiblePosition.replace });
      }
      if (possiblePosition.isInsert()) {
        itemBlanks.splice(possiblePosition.insert, 0, dummyBlank);
      } else {
        itemBlanks[possiblePosition.replace] = dummyBlank;
      }
    }

    var overflowItemBlanks: ItemBlank[];
    if (maxItems < itemBlanks.length) {
      overflowItemBlanks = itemBlanks.slice(maxItems);
      itemBlanks = itemBlanks.slice(0, maxItems);
    } else {
      overflowItemBlanks = [];
    }

    var itemX = 0;
    var filterItems = itemBlanks.map((itemBlank) => {
      var style = transformStyle(itemX, 0);
      itemX += sectionWidth;
      return this.renderItemBlank(itemBlank, style);
    });

    var overflowIndicator: JSX.Element = null;
    if (overflowItemBlanks.length) {
      overflowIndicator = this.renderOverflow(overflowItemBlanks);
    }

    return <div
      className={classNames('filter-tile', (overflowIndicator ? 'has-overflow' : 'no-overflow'))}
      onDragEnter={this.dragEnter.bind(this)}

    >
      <div className="title">{STRINGS.filter}</div>
      <div className="items" ref="items">
        {filterItems}
      </div>
      {overflowIndicator}
      {dragPosition ? <FancyDragIndicator dragPosition={dragPosition}/> : null}
      {dragPosition ? <div
        className="drag-mask"
        onDragOver={this.dragOver.bind(this)}
        onDragLeave={this.dragLeave.bind(this)}
        onDrop={this.drop.bind(this)}
      /> : null}
      {this.renderMenu()}
    </div>;
  }
}
