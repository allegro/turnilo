require('./dimension-list-tile.css');

import * as React from 'react';
import { Fn } from "../../../common/utils/general/general";
import { STRINGS, TITLE_HEIGHT, DIMENSION_HEIGHT, MAX_SEARCH_LENGTH } from '../../config/constants';
import { DragManager } from '../../utils/drag-manager/drag-manager';
import { findParentWithClass, setDragGhost, transformStyle, classNames } from '../../utils/dom/dom';
import { Stage, Clicker, Essence, VisStrategy, Dimension, SplitCombine } from '../../../common/models/index';
import { SvgIcon } from '../svg-icon/svg-icon';
import { DimensionActionsMenu } from '../dimension-actions-menu/dimension-actions-menu';
import { TileHeaderIcon } from '../tile-header/tile-header';
import { HighlightString } from '../highlight-string/highlight-string';
import { SearchableTile } from '../searchable-tile/searchable-tile';

const DIMENSION_CLASS_NAME = 'dimension';

export interface DimensionListTileProps extends React.Props<any> {
  clicker: Clicker;
  essence: Essence;
  menuStage: Stage;
  triggerFilterMenu: Fn;
  triggerSplitMenu: Fn;
  getUrlPrefix?: () => string;
}

export interface DimensionListTileState {
  DimensionActionsMenuAsync?: typeof DimensionActionsMenu;
  menuOpenOn?: Element;
  menuDimension?: Dimension;
  highlightDimension?: Dimension;
  showSearch?: boolean;
  searchText?: string;
}

export class DimensionListTile extends React.Component<DimensionListTileProps, DimensionListTileState> {

  constructor() {
    super();
    this.state = {
      DimensionActionsMenuAsync: null,
      menuOpenOn: null,
      menuDimension: null,
      highlightDimension: null,
      showSearch: false,
      searchText: ''
    };
  }

  componentDidMount() {
    require.ensure(['../dimension-actions-menu/dimension-actions-menu'], (require) => {
      this.setState({
        DimensionActionsMenuAsync: require('../dimension-actions-menu/dimension-actions-menu').DimensionActionsMenu
      });
    }, 'dimension-actions-menu');
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

  toggleSearch() {
    var { showSearch } = this.state;
    this.setState({ showSearch: !showSearch });
    this.onSearchChange('');
  }

  onSearchChange(text: string) {
    var { searchText } = this.state;
    var newSearchText = text.substr(0, MAX_SEARCH_LENGTH);

    if (searchText === newSearchText) return; // nothing to do;

    this.setState({
      searchText: newSearchText
    });
  }

  renderMenu(): JSX.Element {
    var { essence, clicker, menuStage, triggerFilterMenu, triggerSplitMenu } = this.props;
    var { DimensionActionsMenuAsync, menuOpenOn, menuDimension } = this.state;
    if (!DimensionActionsMenuAsync || !menuDimension) return null;
    var onClose = this.closeMenu.bind(this);

    return <DimensionActionsMenuAsync
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
    var { menuDimension, highlightDimension, showSearch, searchText } = this.state;
    var { dataSource } = essence;
    var dimensionItems: JSX.Element[] = [];
    var rowData = dataSource.dimensions.toArray();
    var itemY = 0;

    if (searchText) {
      var searchTextLower = searchText.toLowerCase();
      dimensionItems = rowData.map((dimension => {
        var className = classNames(
          DIMENSION_CLASS_NAME,
          'type-' + dimension.className,
          {
            highlight: dimension === highlightDimension,
            selected: dimension === menuDimension
          }
        );
        var dimensionName = dimension.name;
        if (dimension.title.toLowerCase().indexOf(searchTextLower) !== -1) {
          var style = transformStyle(0, itemY);
          itemY += DIMENSION_HEIGHT;
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
            <div
              className="item-title"
              key={dimensionName}
              onClick={this.clickDimension.bind(this, dimension)}
            >
              <HighlightString className="label" text={dimension.title} highlightText={searchText} />
            </div>
          </div>;
        } else {
          return null;
        }
      }));
    } else {
      dimensionItems = rowData.map((dimension, i) => {
        var className = classNames(
          DIMENSION_CLASS_NAME,
          'type-' + dimension.className,
          {
            highlight: dimension === highlightDimension,
            selected: dimension === menuDimension
          }
        );
        var style = transformStyle(0, itemY);
        itemY += DIMENSION_HEIGHT;

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
    }
    const style = {
      flex: dimensionItems.length + 2
    };

    var icons: TileHeaderIcon[] = [
      //{ name: 'more', onClick: null, svg: require('../../icons/full-more-mini.svg') }
      {
        name: 'search',
        ref: 'search',
        onClick: this.toggleSearch.bind(this),
        svg: require('../../icons/full-search.svg'),
        active: showSearch
      }
    ];

    const className = classNames(
      'dimension-list-tile',
      (showSearch ? 'has-search' : 'no-search')
    );
    const body = <div className="items" ref="items">
      {dimensionItems}
    </div>;
    const renderMenu = this.renderMenu.bind(this);

    return <SearchableTile
      style={style}
      title={STRINGS.dimensions}
      toggleChangeFn={this.toggleSearch.bind(this)}
      onSearchChange={this.onSearchChange.bind(this)}
      searchText={searchText}
      showSearch={showSearch}
      icons={icons}
      className={className}
      body={body}
      additionalFn={renderMenu}
    />;

  }
}
