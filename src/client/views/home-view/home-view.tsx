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
import { Customization, DataCube, User } from "../../../common/models";
import { Fn } from "../../../common/utils";
import { ClearableInput, SvgIcon } from "../../components";
import { STRINGS } from "../../config/constants";
import filterDataCubes from "../../utils/data-cubes-filter/data-cubes-filter";
import { DataCubeCard } from "./data-cube-card/data-cube-card";
import { HomeHeaderBar } from "./home-header-bar/home-header-bar";
import "./home-view.scss";

export interface HomeViewProps {
  dataCubes?: DataCube[];
  user?: User;
  onNavClick?: Fn;
  onOpenAbout: Fn;
  customization?: Customization;
}

export interface HomeViewState {
  query: string;
}

function goToSettings() {
  window.location.hash = "#settings";
}

function goToDataCube(name: string) {
  window.location.hash = "#" + name;
}

export class HomeView extends React.Component<HomeViewProps, HomeViewState> {

  state = { query: "" };

  queryChange = (query: string) => {
    this.setState(state => ({ ...state, query }));
  }

  renderSettingsIcon() {
    const { user } = this.props;
    if (!user || !user.allow["settings"]) return null;

    return <div className="icon-button" onClick={goToSettings}>
      <SvgIcon svg={require("../../icons/full-settings.svg")}/>
    </div>;
  }

  renderDataCube({ name, title, description, extendedDescription }: DataCube): JSX.Element {
    return <DataCubeCard
      key={name}
      title={title}
      description={description}
      extendedDescription={extendedDescription}
      icon="full-cube"
      onClick={() => goToDataCube(name)}
    />;
  }

  renderDataCubes(): JSX.Element {
    const { dataCubes } = this.props;
    const { query } = this.state;
    const cubes = filterDataCubes(dataCubes, query);

    if (cubes.length === 0) {
      const message = query ? `${STRINGS.noDataCubesFound}${query}` : STRINGS.noDataCubes;
      return <div className="data-cubes__message">{message}</div>;
    }
    return <div className="data-cubes__container">{cubes.map(this.renderDataCube)}</div>;
  }

  render() {
    const { user, onNavClick, onOpenAbout, customization } = this.props;
    const { query } = this.state;

    return <div className="home-view">
      <HomeHeaderBar
        user={user}
        onNavClick={onNavClick}
        customization={customization}
        title={STRINGS.home}
      >
        <button className="text-button" onClick={onOpenAbout}>
          {STRINGS.infoAndFeedback}
        </button>
        {this.renderSettingsIcon()}
      </HomeHeaderBar>

      <div className="container">
        <div className="data-cubes">
          <div className="data-cubes__search-box">
            <ClearableInput
              onChange={this.queryChange}
              value={query}
              placeholder="Search data cubes..."
              focusOnMount={true}/>
          </div>
          {this.renderDataCubes()}
        </div>
      </div>
    </div>;
  }
}
