/*
 * Copyright 2015-2016 Imply Data, Inc.
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

require('./home-view.css');

import * as React from 'react';
import { Stage, DataCube, User, Customization } from '../../../common/models/index';
import { STRINGS } from '../../config/constants';
import { Fn } from '../../../common/utils/general/general';

import { HomeHeaderBar } from '../../components/home-header-bar/home-header-bar';
import { SvgIcon } from '../../components/svg-icon/svg-icon';
import { ItemCard } from './item-card/item-card';

export interface HomeViewProps extends React.Props<any> {
  dataCubes?: DataCube[];
  user?: User;
  onNavClick?: Fn;
  onOpenAbout: Fn;
  customization?: Customization;
}

export interface HomeViewState {
}

export class HomeView extends React.Component< HomeViewProps, HomeViewState> {

  goToCube(cube: DataCube) {
    window.location.hash = '#' + cube.name;
  }

  goToSettings() {
    window.location.hash = '#settings';
  }

  renderCube(cube: DataCube): JSX.Element {
    return <ItemCard
      key={cube.name}
      title={cube.title}
      description={cube.description}
      icon="full-cube"
      onClick={this.goToCube.bind(this, cube)}
    />;
  }

  renderCubes(cubes: DataCube[]): JSX.Element {
    return <div className="datacubes">
      <div className="title">{STRINGS.dataCubes}</div>
      <div className="cubes-container">
        {cubes.map(this.renderCube, this)}

        {/* So that the last item doesn't span on the entire row*/}
        <div className="item-card empty"/>
        <div className="item-card empty"/>
        <div className="item-card empty"/>
        <div className="item-card empty"/>
      </div>
    </div>;
  }

  render() {
    const { user, dataCubes, onNavClick, onOpenAbout, customization } = this.props;

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
        <div className="icon-button" onClick={this.goToSettings.bind(this)}>
         <SvgIcon svg={require('../../icons/full-settings.svg')}/>
        </div>
      </HomeHeaderBar>

      <div className="container">
        {this.renderCubes(dataCubes)}
      </div>

    </div>;
  }
}
