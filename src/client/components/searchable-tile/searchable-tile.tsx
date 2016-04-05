require('./searchable-tile.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure } from '../../../common/models/index';
// import { ... } from '../../config/constants';
import { SvgIcon } from '../svg-icon/svg-icon';
import { Fn } from "../../../common/utils/general/general";
import { setDragGhost, isInside, escapeKey, classNames } from '../../utils/dom/dom';

import { TileHeader, TileHeaderIcon } from '../tile-header/tile-header';
import { ClearableInput } from '../clearable-input/clearable-input';


// I am: import { SearchableTile } from '../searchable-tile/searchable-tile';

export interface SearchableTileProps extends React.Props<any> {
  toggleChangeFn: Fn;
  onSearchChange: (text: string) => void;
  searchText: string;
  showSearch: boolean;
  icons: TileHeaderIcon[];
  className: string;
  style: Lookup<any>;
  title: string;
  body: JSX.Element;
  folder?: JSX.Element;
  queryError?: JSX.Element;
  loader?: JSX.Element;
  onDragStart?: Fn;
  additionalFn?: Fn;
}

export interface SearchableTileState {
}

const SEARCH_BOX_HEIGHT = 26;
const SEARCH_BOX_GAP = 3;

export class SearchableTile extends React.Component<SearchableTileProps, SearchableTileState> {
  public mounted: boolean;

  constructor() {
    super();
    // this.state = {};
    this.globalMouseDownListener = this.globalMouseDownListener.bind(this);
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    window.addEventListener('mousedown', this.globalMouseDownListener);
    window.addEventListener('keydown', this.globalKeyDownListener);
  }

  componentWillUnmount() {
    this.mounted = false;
    window.removeEventListener('mousedown', this.globalMouseDownListener);
    window.removeEventListener('keydown', this.globalKeyDownListener);
  }

  componentWillReceiveProps(nextProps: SearchableTileProps) {

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


  render() {
    const { className, style, icons, title, onSearchChange, showSearch, searchText, body, folder, queryError, loader, onDragStart, additionalFn } = this.props;
    const qualifiedClassName = "searchable-tile " + className;
    const header = <TileHeader
      title={title}
      icons={icons}
      ref="header"
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
    return <div className={qualifiedClassName} style={style} >
      { header }
      { searchBar }
      { body }
      { folder }
      { queryError }
      { loader }
      { additionalFn ? additionalFn() : null }
    </div>;
  }
}
