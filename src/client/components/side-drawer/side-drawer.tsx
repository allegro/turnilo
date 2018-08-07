/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2018 Allegro.pl
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

import * as React from "react";
import * as ReactDOM from "react-dom";
import { Customization, DataCube, User } from "../../../common/models";
import { Fn } from "../../../common/utils/general/general";
import { STRINGS } from "../../config/constants";
import filterDataCubes from "../../utils/data-cubes-filter/data-cubes-filter";
import { classNames, escapeKey, isInside } from "../../utils/dom/dom";
import { ClearableInput } from "../clearable-input/clearable-input";
import { NavAction, NavList } from "../nav-list/nav-list";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./side-drawer.scss";

export interface SideDrawerProps {
  user: User;
  selectedItem: DataCube;
  dataCubes: DataCube[];
  onOpenAbout: Fn;
  onClose: Fn;
  customization?: Customization;
  itemHrefFn?: (oldItem?: DataCube, newItem?: DataCube) => string;
  viewType: "home" | "cube" | "settings" | "no-data";
}

function openHome() {
  window.location.hash = "#";
}

function openSettings() {
  window.location.hash = "#settings";
}

export interface SideDrawerState {
  query: string;
}

export class SideDrawer extends React.Component<SideDrawerProps, SideDrawerState> {

  state = { query: "" };

  queryChange = (query: string) => {
    this.setState(state => ({ ...state, query }));
  }

  globalMouseDownListener = (e: MouseEvent) => {
    const myElement = ReactDOM.findDOMNode(this);
    const target = e.target as Element;

    if (isInside(target, myElement)) return;
    this.props.onClose();
  }

  globalKeyDownListener = (e: KeyboardEvent) => {
    if (!escapeKey(e)) return;
    this.props.onClose();
  }

  componentDidMount() {
    window.addEventListener("mousedown", this.globalMouseDownListener);
    window.addEventListener("keydown", this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener("mousedown", this.globalMouseDownListener);
    window.removeEventListener("keydown", this.globalKeyDownListener);
  }

  private renderHomeLink() {
    const { viewType } = this.props;

    return <div className="home-container">
      <div
        className={classNames("home-link", { selected: viewType === "home" })}
        onClick={openHome}
      >
        <SvgIcon svg={require("../../icons/home.svg")}/>
        <span>Home</span>
      </div>
    </div>;
  }

  private renderDataCubeList(): JSX.Element {
    const { dataCubes, itemHrefFn, selectedItem } = this.props;
    const { query } = this.state;

    const cubes = filterDataCubes(dataCubes, query, false);
    if (cubes.length === 0) {
      const message = query ? `${STRINGS.noDataCubesFound}${query}` : STRINGS.noDataCubes;
      return <div className="data-cubes__message">{message}</div>;
    }
    const navLinks = cubes.map(dataCube => ({
        name: dataCube.name,
        title: dataCube.title,
        href: itemHrefFn(selectedItem, dataCube) || `#${dataCube.name}`
      })
    );

    return <NavList
      selected={selectedItem ? selectedItem.name : null}
      navLinks={navLinks}
      iconSvg={require("../../icons/full-cube.svg")}
    />;
  }

  private renderDataCubes(): JSX.Element {
    const { query } = this.state;

    return <div className="data-cubes__list">
      <div className="search-input">
        <ClearableInput value={query} onChange={this.queryChange} placeholder="Search data cubes..."/>
      </div>
      {this.renderDataCubeList()}
    </div>;
  }

  private otherNavLinks(): NavAction[] {
    const { user, onClose, onOpenAbout } = this.props;

    const info: NavAction = {
      name: "info",
      title: STRINGS.infoAndFeedback,
      tooltip: "Learn more about Turnilo",
      onClick: () => {
        onClose();
        onOpenAbout();
      }
    };

    if (user && user.allow["settings"]) {
      const settings: NavAction = {
        name: "settings",
        title: STRINGS.settings,
        tooltip: "Settings",
        onClick: () => {
          onClose();
          openSettings();
        }
      };
      return [settings, info];
    }

    return [info];
  }

  render() {
    const { onClose, customization } = this.props;
    const customLogoSvg = customization ? customization.customLogoSvg : null;

    return <div className="side-drawer">
      {this.renderHomeLink()}
      {this.renderDataCubes()}
      <NavList navLinks={this.otherNavLinks()}/>
    </div>;
  }
}
