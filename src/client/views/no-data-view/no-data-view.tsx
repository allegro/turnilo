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

require('./no-data-view.css');

import * as React from 'react';
import { User, Customization, AppSettings } from '../../../common/models/index';
import { STRINGS } from '../../config/constants';
import { Fn } from '../../../common/utils/general/general';

import { SvgIcon } from '../../components/index';

import { NoDataHeaderBar} from './no-data-header-bar/no-data-header-bar';

export type Mode = 'no-cluster' | 'no-cube';

export interface NoDataViewProps extends React.Props<any> {
  user?: User;
  appSettings?: AppSettings;
  onNavClick?: Fn;
  onOpenAbout: Fn;
  customization?: Customization;
  stateful: boolean;
}

export interface NoDataViewState {
  mode?: Mode;
}

export class NoDataView extends React.Component <NoDataViewProps, NoDataViewState> {

  static NO_CLUSTER: Mode = 'no-cluster';
  static NO_CUBE: Mode = 'no-cube';

  constructor() {
    super();
    this.state = {};
  }

  componentWillReceiveProps(nextProps: NoDataViewProps) {
    const { clusters } = nextProps.appSettings;

    if (!clusters || !clusters.length) {
      this.setState({
        mode: NoDataView.NO_CLUSTER
      });
    } else {
      this.setState({
        mode: NoDataView.NO_CUBE
      });
    }
  }

  goToSettings() {
    window.location.hash = '#settings';
  }

  renderSettingsIcon() {
    const { user, stateful } = this.props;
    if (!user || !user.allow['settings'] || !stateful) return null;

    return <div className="icon-button" onClick={this.goToSettings.bind(this)}>
      <SvgIcon svg={require('../../icons/full-settings.svg')}/>
    </div>;
  }

  renderTitle(mode: Mode): JSX.Element {
    return <div className="title">
      <div className="icon">
        <SvgIcon svg={require('../../icons/data-cubes.svg')}/>
      </div>
      <div className="label">{mode === NoDataView.NO_CUBE ? STRINGS.noQueryableDataCubes : STRINGS.noConnectedData}</div>
    </div>;
  }

  renderLink(mode: Mode): JSX.Element {
    const link = mode === NoDataView.NO_CUBE
      ? <a href="#settings/data-cubes">cubes settings</a>
      : <a href="#settings/clusters">clusters settings</a>
    ;

    return <div className="action">Please go to the {link}</div>;
  }

  render() {
    const { user, onNavClick, onOpenAbout, customization, stateful } = this.props;
    const { mode } = this.state;

    return <div className="no-data-view">
      <NoDataHeaderBar
        user={user}
        onNavClick={onNavClick}
        customization={customization}
        title={STRINGS.home}
      >
        <button className="text-button" onClick={onOpenAbout}>
          {STRINGS.infoAndFeedback}
        </button>
        {this.renderSettingsIcon()}
      </NoDataHeaderBar>
      <div className="container">
        { this.renderTitle(mode) }
        { stateful ? this.renderLink(mode) : null }
      </div>
    </div>;
  }
}
