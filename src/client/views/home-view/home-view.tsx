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
import { ClientCustomization } from "../../../common/models/customization/customization";
import { ClientDataCube } from "../../../common/models/data-cube/data-cube";
import { Fn } from "../../../common/utils/general/general";
import { ClearableInput } from "../../components/clearable-input/clearable-input";
import { HeaderBar } from "../../components/header-bar/header-bar";
import { EmptyDataCubeList } from "../../components/no-data/empty-data-cube-list";
import { STRINGS } from "../../config/constants";
import filterDataCubes from "../../utils/data-cubes-filter/data-cubes-filter";
import { DataCubeCard } from "./data-cube-card/data-cube-card";
import "./home-view.scss";

export interface HomeViewProps {
  dataCubes?: ClientDataCube[];
  onOpenAbout: Fn;
  customization?: ClientCustomization;
}

export interface HomeViewState {
  query: string;
}

function goToDataCube(name: string) {
  window.location.hash = "#" + name;
}

export class HomeView extends React.Component<HomeViewProps, HomeViewState> {

  state = { query: "" };

  queryChange = (query: string) => {
    this.setState(state => ({ ...state, query }));
  };

  renderDataCube({ name, title, description, extendedDescription }: ClientDataCube): JSX.Element {
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
    const { onOpenAbout, dataCubes } = this.props;
    const { query } = this.state;
    const hasDataCubes = dataCubes.length > 0;

    return <div className="home-view">
      <HeaderBar title={STRINGS.home}>
        <button className="text-button" onClick={onOpenAbout}>
          {STRINGS.infoAndFeedback}
        </button>
      </HeaderBar>

      <div className="container">
        {!hasDataCubes
          ? <EmptyDataCubeList />
          : <div className="data-cubes">
            <div className="data-cubes__search-box">
              <ClearableInput
                onChange={this.queryChange}
                value={query}
                placeholder="Search data cubes..."
                focusOnMount={true}/>
            </div>
            {this.renderDataCubes()}
          </div>}
      </div>
    </div>;
  }
}
