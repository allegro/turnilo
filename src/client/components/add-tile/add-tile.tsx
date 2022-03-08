/*
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
import { Stage } from "../../../common/models/stage/stage";
import { Unary } from "../../../common/utils/functional/functional";
import { BubbleMenu } from "../bubble-menu/bubble-menu";
import { ClearableInput } from "../clearable-input/clearable-input";
import { HighlightString } from "../highlight-string/highlight-string";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./add-tile.scss";

export interface Tile<T> {
  key: string;
  label: string;
  value: T;
}

interface AddTileProps<T> {
  tiles: Array<Tile<T>>;
  onSelect: Unary<T, void>;
  containerStage: Stage;
}

interface AddTileState {
  openMenu: boolean;
  query: string;
}

export class AddTile<T> extends React.Component<AddTileProps<T>, AddTileState> {

  state: AddTileState = { openMenu: false, query: "" };

  private menuOpenOn: HTMLElement = null;

  mountAdd = (addButton: HTMLElement) => {
    this.menuOpenOn = addButton;
  };

  closeMenu = () => this.setState({ openMenu: false });

  openMenu = () => this.setState({ openMenu: true });

  setQuery = (query: string) => this.setState({ query });

  resetQuery = () => this.setQuery("");

  selectTile = (value: T) => {
    this.props.onSelect(value);
    this.resetQuery();
    this.closeMenu();
  };

  renderRows(rows: Array<Tile<T>>) {
    const { query } = this.state;
    return rows.map(({ value, key, label }) => <div
      className="tile-row"
      key={key}
      onClick={() => this.selectTile(value)}>
      <HighlightString className="label" text={label} highlight={query} />
    </div>);
  }

  renderTable() {
    const { tiles } = this.props;
    const { query } = this.state;
    if (query.length === 0) return this.renderRows(tiles);
    const filteredRows = tiles.filter(({ label }) =>
      label.toLowerCase().includes(query.toLowerCase()));
    if (filteredRows.length > 0) return this.renderRows(filteredRows);
    return <div className="tile-row no-results">
      No results for {query}
    </div>;
  }

  renderMenu() {
    const { containerStage } = this.props;
    const { openMenu, query } = this.state;
    if (!openMenu) return null;

    return <BubbleMenu
      className="add-tile-menu"
      direction="down"
      stage={Stage.fromSize(250, 410)}
      containerStage={containerStage}
      openOn={this.menuOpenOn}
      onClose={this.closeMenu}>
      <div className="search-box">
        <ClearableInput
          placeholder="Search"
          focusOnMount={true}
          value={query}
          onChange={this.setQuery} />
      </div>
      <div className="tile-rows">
        {this.renderTable()}
      </div>
    </BubbleMenu>;
  }

  render() {
    return <div className="add-tile">
      <div className="add-button" ref={this.mountAdd} onClick={this.openMenu}>
        <SvgIcon svg={require("../../icons/preview-subsplit.svg")} />
      </div>
      {this.renderMenu()}
    </div>;
  }
}
