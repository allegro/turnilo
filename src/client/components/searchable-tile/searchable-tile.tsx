/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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

import React from "react";
import * as ReactDOM from "react-dom";
import { Stage } from "../../../common/models/stage/stage";
import { Fn } from "../../../common/utils/general/general";
import { classNames, escapeKey, isInside } from "../../utils/dom/dom";
import { BubbleMenu } from "../bubble-menu/bubble-menu";
import { ClearableInput } from "../clearable-input/clearable-input";
import { TileHeader, TileHeaderIcon } from "../tile-header/tile-header";
import "./searchable-tile.scss";

export interface TileAction {
  selected: boolean;
  onSelect: Fn;
  keyString?: string;
  displayValue?: string;
}

export interface SearchableTileProps {
  toggleChangeFn: Fn;
  onSearchChange: (text: string) => void;
  searchText: string;
  showSearch: boolean;
  icons: TileHeaderIcon[];
  className?: string;
  style: Record<string, any>;
  title: string;
  onDragStart?: (event: React.DragEvent<HTMLElement>) => void;
  actions?: TileAction[];
}

export interface SearchableTileState {
  actionsMenuOpenOn?: Element;
  actionsMenuAlignOn?: Element;
}

export class SearchableTile extends React.Component<SearchableTileProps, SearchableTileState> {
  public mounted: boolean;

  state: SearchableTileState = {
    actionsMenuOpenOn: null
  };

  componentDidMount() {
    this.mounted = true;
    this.setState({ actionsMenuAlignOn: ReactDOM.findDOMNode(this.refs["header"]) as Element });
    window.addEventListener("mousedown", this.globalMouseDownListener);
    window.addEventListener("keydown", this.globalKeyDownListener);
  }

  componentWillUnmount() {
    this.mounted = false;
    window.removeEventListener("mousedown", this.globalMouseDownListener);
    window.removeEventListener("keydown", this.globalKeyDownListener);
  }

  globalMouseDownListener = (e: MouseEvent) => {
    const { searchText, toggleChangeFn } = this.props;

    // Remove search if it looses focus while empty
    if (searchText !== "") return;

    const target = e.target as Element;

    const searchBoxElement = ReactDOM.findDOMNode(this.refs["search-box"]);
    if (!searchBoxElement || isInside(target, searchBoxElement)) return;

    const headerRef = this.refs["header"];
    if (!headerRef || headerRef instanceof Element) return;
    const searchButtonElement = ReactDOM.findDOMNode(headerRef.refs["search"]);
    if (!searchButtonElement || isInside(target, searchButtonElement)) return;

    toggleChangeFn();
  };

  globalKeyDownListener = (e: KeyboardEvent) => {
    const { toggleChangeFn, showSearch } = this.props;
    if (!escapeKey(e)) return;
    if (!showSearch) return;
    toggleChangeFn();
  };

  onActionsMenuClose = () => {
    const { actionsMenuOpenOn } = this.state;
    if (!actionsMenuOpenOn) return;
    this.setState({
      actionsMenuOpenOn: null
    });
  };

  onActionsMenuClick = (e: React.MouseEvent<HTMLElement>) => {
    const { actionsMenuOpenOn } = this.state;
    if (actionsMenuOpenOn) return this.onActionsMenuClose();
    this.setState({
      actionsMenuOpenOn: e.target as Element
    });
  };

  onSelectGranularity(action: TileAction) {
    this.onActionsMenuClose();
    action.onSelect();
  }

  renderGranularityElements() {
    const { actions } = this.props;

    return actions.map((action: TileAction) => {
      return <li
        className={classNames({ selected: action.selected })}
        key={action.keyString || action.toString()}
        onClick={this.onSelectGranularity.bind(this, action)}
      >
        {action.displayValue || action.toString()}
      </li>;
    });
  }

  renderActionsMenu() {
    const { actionsMenuOpenOn, actionsMenuAlignOn } = this.state;

    const stage = Stage.fromSize(180, 200);

    return <BubbleMenu
      align="end"
      className="dimension-tile-actions"
      direction="down"
      stage={stage}
      onClose={this.onActionsMenuClose}
      openOn={actionsMenuOpenOn}
      alignOn={actionsMenuAlignOn}
    >
      <ul className="bubble-list">
        {this.renderGranularityElements()}
      </ul>
    </BubbleMenu>;
  }

  render() {
    const {
      className, style, icons, title, onSearchChange, showSearch, searchText,
      children, onDragStart, actions
    } = this.props;
    const { actionsMenuOpenOn } = this.state;
    let tileIcons = icons;

    if (actions && actions.length > 0) {
      tileIcons = [({
        name: "more",
        ref: "more",
        onClick: this.onActionsMenuClick,
        svg: require("../../icons/full-more.svg"),
        active: Boolean(actionsMenuOpenOn)
      } as TileHeaderIcon)].concat(icons);
    }

    let qualifiedClassName = "searchable-tile " + className;
    const header = <TileHeader
      title={title}
      ref="header"
      icons={tileIcons}
      onDragStart={onDragStart}
    />;

    let searchBar: JSX.Element = null;
    if (showSearch) {
      searchBar = <div className="search-box" ref="search-box">
        <ClearableInput
          placeholder="Search"
          focusOnMount={true}
          value={searchText}
          onChange={onSearchChange}
        />
      </div>;
    }

    qualifiedClassName = classNames(qualifiedClassName, (showSearch ? "has-search" : "no-search"));

    return <div className={qualifiedClassName} style={style}>
      {header}
      {searchBar}
      {actionsMenuOpenOn ? this.renderActionsMenu() : null}
      {children}
    </div>;
  }
}
