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
import { ClientCustomization } from "../../../common/models/customization/customization";
import { ClientDataCube } from "../../../common/models/data-cube/data-cube";
import { Essence } from "../../../common/models/essence/essence";
import { Ternary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { navigateToHome } from "../../applications/turnilo-application/view";
import { STRINGS } from "../../config/constants";
import filterDataCubes from "../../utils/data-cubes-filter/data-cubes-filter";
import { classNames, escapeKey, isInside } from "../../utils/dom/dom";
import { ClearableInput } from "../clearable-input/clearable-input";
import { NavAction, NavList } from "../nav-list/nav-list";
import { NavLogo } from "../nav-logo/nav-logo";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./side-drawer.scss";

export interface SideDrawerProps {
  essence: Essence;
  dataCubes: ClientDataCube[];
  onOpenAbout: Fn;
  onClose: Fn;
  customization?: ClientCustomization;
  changeDataCubeAndEssence: Ternary<ClientDataCube, Essence, boolean, void>;
}

export interface SideDrawerState {
  query: string;
}

export class SideDrawer extends React.Component<SideDrawerProps, SideDrawerState> {

  state = { query: "" };

  queryChange = (query: string) => {
    this.setState(state => ({ ...state, query }));
  };

  globalMouseDownListener = (e: MouseEvent) => {
    const myElement = ReactDOM.findDOMNode(this) as Element;
    const target = e.target as Element;

    if (isInside(target, myElement)) return;
    this.props.onClose();
  };

  globalKeyDownListener = (e: KeyboardEvent) => {
    if (!escapeKey(e)) return;
    this.props.onClose();
  };

  componentDidMount() {
    window.addEventListener("mousedown", this.globalMouseDownListener);
    window.addEventListener("keydown", this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener("mousedown", this.globalMouseDownListener);
    window.removeEventListener("keydown", this.globalKeyDownListener);
  }

  private renderNavLogo(): JSX.Element | null {
    const { customization } = this.props;
    if (!customization.customLogoSvg) return null;
    return <NavLogo customLogoSvg={customization.customLogoSvg} />;
  }

  private renderHomeLink() {
    return <div className="home-container">
      <div
        className={classNames("home-link")}
        onClick={navigateToHome}
      >
        <SvgIcon svg={require("../../icons/home.svg")} />
        <span>Home</span>
      </div>
    </div>;
  }

  navigateToCube = (dataCube: ClientDataCube) => {
    const { onClose, essence, changeDataCubeAndEssence } = this.props;
    changeDataCubeAndEssence(dataCube, essence.updateDataCube(dataCube), true);
    onClose();
  };

  private renderDataCubeList(): JSX.Element {
    const { dataCubes, essence: { dataCube } } = this.props;
    const { query } = this.state;

    const cubes = filterDataCubes(dataCubes, query, false);
    if (cubes.length === 0) {
      const message = query ? `${STRINGS.noDataCubesFound}${query}` : STRINGS.noDataCubes;
      return <div className="data-cubes__message">{message}</div>;
    }
    const navLinks = cubes.map(dataCube => {
        const { name, title } = dataCube;
        return {
          name,
          title,
          onClick: () => this.navigateToCube(dataCube)
        };
      }
    );

    return <NavList
      selected={dataCube.name}
      navLinks={navLinks}
      iconSvg={require("../../icons/full-cube.svg")}
    />;
  }

  private renderDataCubes(): JSX.Element {
    const { query } = this.state;

    return <div className="data-cubes__list">
      <div className="search-input">
        <ClearableInput value={query} onChange={this.queryChange} placeholder="Search data cubes..." />
      </div>
      {this.renderDataCubeList()}
    </div>;
  }

  private infoLink(): NavAction {
    const { onClose, onOpenAbout } = this.props;

    return {
      name: "info",
      title: STRINGS.infoAndFeedback,
      tooltip: "Learn more about Turnilo",
      onClick: () => {
        onClose();
        onOpenAbout();
      }
    };
  }

  render() {
    return <div className="side-drawer">
      {this.renderNavLogo()}
      {this.renderHomeLink()}
      {this.renderDataCubes()}
      <NavList navLinks={[this.infoLink()]} />
    </div>;
  }
}
