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

require('./settings-view.css');

import * as React from 'react';
import { $, Expression, Executor, Dataset } from 'plywood';
import { DataCube, User, Customization } from '../../../common/models/index';
import { MANIFESTS } from '../../../common/manifests/index';
import { STRINGS } from '../../config/constants';
import { Fn } from '../../../common/utils/general/general';
import { Ajax } from '../../utils/ajax/ajax';

import { classNames } from '../../utils/dom/dom';
import { Notifier } from '../../components/notifications/notifications';

import { Button, SvgIcon, Router, Route } from '../../components/index';

import { AppSettings } from '../../../common/models/index';

import { SettingsHeaderBar } from './settings-header-bar/settings-header-bar';
import { General } from './general/general';
import { Clusters } from './clusters/clusters';
import { ClusterEdit } from './cluster-edit/cluster-edit';
import { DataCubes } from './data-cubes/data-cubes';
import { DataCubeEdit } from './data-cube-edit/data-cube-edit';


export interface SettingsViewProps extends React.Props<any> {
  user?: User;
  customization?: Customization;
  onNavClick?: Fn;
  onSettingsChange?: (settings: AppSettings) => void;
}

export interface SettingsViewState {
  errorText?: string;
  messageText?: string;
  settings?: AppSettings;
  breadCrumbs?: string[];
}

const VIEWS = [
  {label: 'General', value: 'general', svg: require('../../icons/full-settings.svg')},
  {label: 'Clusters', value: 'clusters', svg: require('../../icons/full-cluster.svg')},
  {label: 'Data Cubes', value: 'data_cubes', svg: require('../../icons/full-cube.svg')}
];

export class SettingsView extends React.Component<SettingsViewProps, SettingsViewState> {
  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      errorText: '',
      messageText: 'Welcome to the world of settings!'
    };
  }

  componentDidMount() {
    this.mounted = true;

    Ajax.query({ method: "GET", url: 'settings' })
      .then(
        (resp) => {
          if (!this.mounted) return;
          this.setState({
            errorText: '',
            messageText: '',
            settings: AppSettings.fromJS(resp.appSettings, { visualizations: MANIFESTS })
          });
        },
        (xhr: XMLHttpRequest) => {
          if (!this.mounted) return;
          var jsonError = JSON.parse(xhr.responseText);
          this.setState({
            errorText: `Server error: ${jsonError}`,
            messageText: ''
          });
        }
      ).done();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onSave(settings: AppSettings, okMessage?: string) {
    const { onSettingsChange } = this.props;

    Ajax.query({
      method: "POST",
      url: 'settings',
      data: {
        appSettings: settings
      }
    })
      .then(
        (status) => {
          if (!this.mounted) return;
          this.setState({settings});
          Notifier.success(okMessage ? okMessage : 'Settings saved');

          if (onSettingsChange) {
            onSettingsChange(settings.toClientSettings().attachExecutors((dataCube: DataCube) => {
              return Ajax.queryUrlExecutorFactory(dataCube.name, 'plywood');
            }));
          }
        },
        (xhr: XMLHttpRequest) => {
          if (!this.mounted) return;
          Notifier.failure('Woops', 'Something bad happened');
        }
      ).done();
  }

  selectTab(value: string) {
    window.location.hash = `settings/${value}`;
  }

  renderLeftButtons(breadCrumbs: string[]): JSX.Element[] {
    if (!breadCrumbs || !breadCrumbs.length) return [];

    return VIEWS.map(({label, value, svg}) => {
      return <Button
        className={classNames({active: breadCrumbs[0] === value})}
        title={label}
        type="primary"
        svg={svg}
        key={value}
        onClick={this.selectTab.bind(this, value)}
      />;
    });
  }

  onURLChange(breadCrumbs: string[]) {
    this.setState({breadCrumbs});
  }

  render() {
    const { user, onNavClick, customization } = this.props;
    const { errorText, messageText, settings, breadCrumbs } = this.state;

    return <div className="settings-view">
      <SettingsHeaderBar
        user={user}
        onNavClick={onNavClick}
        customization={customization}
        title={STRINGS.settings}
      />
     <div className="left-panel">
       {this.renderLeftButtons(breadCrumbs)}
     </div>

     <div className="main-panel">

       <Router
         onURLChange={this.onURLChange.bind(this)}
         rootFragment="settings"
       >

         <Route fragment="general">
           <General settings={settings} onSave={this.onSave.bind(this)}/>
         </Route>

         <Route fragment="clusters">
           <Clusters settings={settings} onSave={this.onSave.bind(this)}/>

           <Route fragment=":clusterId">
             <ClusterEdit settings={settings} onSave={this.onSave.bind(this)}/>
           </Route>
         </Route>

         <Route fragment="data_cubes">
           <DataCubes settings={settings} onSave={this.onSave.bind(this)}/>

           <Route fragment=":cubeId/:tab=general">
             <DataCubeEdit settings={settings} onSave={this.onSave.bind(this)}/>
           </Route>

         </Route>
       </Router>
     </div>
    </div>;
  }
}
