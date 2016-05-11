require('./searchable-tile.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Stage, Granularity, granularityEquals, granularityToString } from '../../../common/models/index';
import { Fn } from '../../../common/utils/general/general';
import { formatGranularity } from '../../../common/utils/time/time';
import { isInside, escapeKey, classNames } from '../../utils/dom/dom';

import { TileHeader, TileHeaderIcon } from '../tile-header/tile-header';
import { ClearableInput } from '../clearable-input/clearable-input';
import { BubbleMenu } from '../bubble-menu/bubble-menu';

export interface TileAction {
  selected: boolean;
  onSelect: Fn;
  keyString?: string;
  displayValue?: string;
}

export interface SearchableTileProps extends React.Props<any> {
  toggleChangeFn: Fn;
  onSearchChange: (text: string) => void;
  searchText: string;
  showSearch: boolean;
  icons: TileHeaderIcon[];
  className?: string;
  style: Lookup<any>;
  title: string;
  onDragStart?: Fn;
  actions?: TileAction[];
}

export interface SearchableTileState {
  actionsMenuOpenOn?: Element;
  actionsMenuAlignOn?: Element;
}

export class SearchableTile extends React.Component<SearchableTileProps, SearchableTileState> {
  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      actionsMenuOpenOn: null
    };

    this.globalMouseDownListener = this.globalMouseDownListener.bind(this);
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    this.setState({ actionsMenuAlignOn: ReactDOM.findDOMNode(this.refs['header']) });
    window.addEventListener('mousedown', this.globalMouseDownListener);
    window.addEventListener('keydown', this.globalKeyDownListener);
  }

  componentWillUnmount() {
    this.mounted = false;
    window.removeEventListener('mousedown', this.globalMouseDownListener);
    window.removeEventListener('keydown', this.globalKeyDownListener);
  }

  globalMouseDownListener(e: MouseEvent) {
    var { searchText, toggleChangeFn } = this.props;

    // Remove search if it looses focus while empty
    if (searchText !== '') return;

    var target = e.target as Element;

    var searchBoxElement = ReactDOM.findDOMNode(this.refs['search-box']);
    if (!searchBoxElement || isInside(target, searchBoxElement)) return;

    var headerRef = this.refs['header'];
    if (!headerRef) return;
    var searchButtonElement = ReactDOM.findDOMNode(headerRef.refs['search']);
    if (!searchButtonElement || isInside(target, searchButtonElement)) return;

    toggleChangeFn();
  }

  globalKeyDownListener(e: KeyboardEvent) {
    const { toggleChangeFn, showSearch } = this.props;
    if (!escapeKey(e)) return;
    if (!showSearch) return;
    toggleChangeFn();
  }

  onActionsMenuClose() {
    var { actionsMenuOpenOn } = this.state;
    if (!actionsMenuOpenOn) return;
    this.setState({
      actionsMenuOpenOn: null
    });
  }

  onActionsMenuClick(e: MouseEvent) {
    var { actionsMenuOpenOn } = this.state;
    if (actionsMenuOpenOn) return this.onActionsMenuClose();
    this.setState({
      actionsMenuOpenOn: e.target as Element
    });
  }

  onSelectGranularity(action: TileAction) {
    this.onActionsMenuClose();
    action.onSelect();
  }

  renderGranularityElements() {
    const { actions } = this.props;

    return actions.map((action: TileAction) => {
      return <li
        className={classNames({selected: action.selected })}
        key={action.keyString || action.toString()}
        onClick={this.onSelectGranularity.bind(this, action)}
      >
        {action.displayValue || action.toString()}
      </li>;
    });
  }

  renderActionsMenu() {
    const { actionsMenuOpenOn, actionsMenuAlignOn } = this.state;

    var stage = Stage.fromSize(180, 200);

    return <BubbleMenu
      align="end"
      className="dimension-tile-actions"
      direction="down"
      stage={stage}
      onClose={this.onActionsMenuClose.bind(this)}
      openOn={actionsMenuOpenOn}
      alignOn={actionsMenuAlignOn}
    >
      <ul className="bubble-list">
        {this.renderGranularityElements()}
      </ul>
    </BubbleMenu>;
  }


  render() {
    const { className, style, icons, title, onSearchChange, showSearch, searchText,
      children, onDragStart, actions } = this.props;
    const { actionsMenuOpenOn } = this.state;
    var tileIcons = icons;

    if (actions && actions.length > 0) {
      tileIcons = [({
        name: 'more',
        ref: 'more',
        onClick: this.onActionsMenuClick.bind(this),
        svg: require('../../icons/full-more.svg'),
        active: Boolean(actionsMenuOpenOn)
      } as TileHeaderIcon)].concat(icons);
    }


    var qualifiedClassName = "searchable-tile " + className;
    const header = <TileHeader
      title={title}
      ref="header"
      icons={tileIcons}
      onDragStart={onDragStart}
    />;

    var searchBar: JSX.Element = null;
    if (showSearch) {
      searchBar = <div className="search-box" ref="search-box">
        <ClearableInput
          placeholder="Search"
          focusOnMount={true}
          value={searchText}
          onChange={onSearchChange.bind(this)}
        />
      </div>;
    }

    qualifiedClassName = classNames(qualifiedClassName, (showSearch ? 'has-search' : 'no-search'));

    return <div className={qualifiedClassName} style={style}>
      { header }
      { searchBar }
      { actionsMenuOpenOn ? this.renderActionsMenu() : null}
      { children }
    </div>;
  }
}
