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
import * as Q from 'q';

import { $, Expression, Executor, Dataset } from 'plywood';
import { DataCube, User, Customization } from '../../../common/models/index';
import { MANIFESTS } from '../../../common/manifests/index';
import { STRINGS } from '../../config/constants';
import { Fn } from '../../../common/utils/general/general';
import { Ajax } from '../../utils/ajax/ajax';
import { indexByAttribute } from '../../../common/utils/array/array';
import { ImmutableUtils } from '../../../common/utils/immutable-utils/immutable-utils';

import { classNames } from '../../utils/dom/dom';
import { Notifier } from '../../components/notifications/notifications';

import { Button, SvgIcon, Router, Route } from '../../components/index';

import { ClusterSeedModal, DataCubeSeedModal } from '../../modals/index';

import { AppSettings, Cluster } from '../../../common/models/index';

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
  settings?: AppSettings;
  breadCrumbs?: string[];

  tempCluster?: Cluster;
  tempDataCube?: DataCube;
}

const VIEWS = [
  {label: 'General', value: 'general', svg: require('../../icons/full-settings.svg')},
  {label: 'Clusters', value: 'clusters', svg: require('../../icons/full-cluster.svg')},
  {label: 'Data Cubes', value: 'data-cubes', svg: require('../../icons/full-cube.svg')}
];

export class SettingsView extends React.Component<SettingsViewProps, SettingsViewState> {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    Ajax.query({ method: "GET", url: 'settings' })
      .then(
        (resp) => {
          this.setState({
            settings: AppSettings.fromJS(resp.appSettings, { visualizations: MANIFESTS })
          });
        },
        (xhr: XMLHttpRequest) => Notifier.failure('Sorry', `The settings couldn't be loaded`)
      ).done();
  }

  onSave(settings: AppSettings, okMessage?: string): Q.Promise<any> {
    const { onSettingsChange } = this.props;

    return Ajax.query({
      method: "POST",
      url: 'settings',
      data: {appSettings: settings}
    })
      .then(
        (status) => {
          this.setState({settings});
          Notifier.success(okMessage ? okMessage : 'Settings saved');

          if (onSettingsChange) {
            onSettingsChange(settings.toClientSettings().attachExecutors((dataCube: DataCube) => {
              return Ajax.queryUrlExecutorFactory(dataCube.name, 'plywood');
            }));
          }
        },
        (xhr: XMLHttpRequest) => Notifier.failure('Woops', 'Something bad happened')
      );
  }

  selectTab(value: string) {
    window.location.hash = `settings/${value}`;
    this.setState({
      tempCluster: null,
      tempDataCube: null
    });
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


  // -- Cluster creation flow

  createCluster(newCluster: Cluster) {
    this.setState({
      tempCluster: newCluster
    });
  }

  addCluster(newCluster: Cluster) {
    this.onSave(
      ImmutableUtils.addInArray(this.state.settings, 'clusters', newCluster),
      'Cluster created'
    ).then(this.backToClustersView.bind(this));
  }

  backToClustersView() {
    window.location.hash = '#settings/clusters';

    this.setState({
      tempCluster: null
    });
  }

  updateCluster(newCluster: Cluster) {
    const { settings } = this.state;

    const index = indexByAttribute(settings.clusters, 'name', newCluster.name);

    this.onSave(
      ImmutableUtils.addInArray(settings, 'clusters', newCluster, index)
    ).then(this.backToClustersView.bind(this));
  }
  // !-- Cluster creation flow

  // -- DataCubes creation flow
  createDataCube(newDataCube: DataCube) {
    this.setState({
      tempDataCube: newDataCube
    });
  }

  addDataCube(newDataCube: DataCube) {
    this.onSave(
      ImmutableUtils.addInArray(this.state.settings, 'dataCubes', newDataCube),
      'Cube created'
    ).then(this.backToDataCubesView.bind(this));
  }

  backToDataCubesView() {
    window.location.hash = '#settings/data-cubes';

    this.setState({
      tempDataCube: null
    });
  }

  updateDataCube(newDataCube: DataCube) {
    const { settings } = this.state;

    const index = indexByAttribute(settings.dataCubes, 'name', newDataCube.name);

    this.onSave(
      ImmutableUtils.addInArray(settings, 'dataCubes', newDataCube, index)
    ).then(this.backToDataCubesView.bind(this));
  }
  // !-- DataCubes creation flow


  render() {
    const { user, onNavClick, customization } = this.props;
    const { settings, breadCrumbs, tempCluster, tempDataCube } = this.state;

    if (!settings) return null;

    const inflateCluster = (key: string, value: string): {key: string, value: any} => {
      if (key !== 'clusterId') return {key, value};

      // TODO : Here we could redirect to another location if the cluster is nowhere to be found.
      // Something along the lines of "This cluster doesn't exist. Or we lost it. We're not sure."

      return {
        key: 'cluster',
        value: settings.clusters.filter((d) => d.name === value)[0]
      };
    };

    const inflateDataCube = (key: string, value: string): {key: string, value: any} => {
      if (key !== 'dataCubeId') return {key, value};

      return {
        key: 'dataCube',
        value: settings.dataCubes.filter((d) => d.name === value)[0]
      };
    };

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

        <Router rootFragment="settings" onURLChange={this.onURLChange.bind(this)}>

          <Route fragment="general">
            <General settings={settings} onSave={this.onSave.bind(this)}/>
          </Route>

          <Route fragment="clusters">
            <Clusters settings={settings} onSave={this.onSave.bind(this)}/>

            <Route fragment="new-cluster">
              { tempCluster ? null : <Clusters settings={settings} onSave={this.onSave.bind(this)}/> }

              { tempCluster
                ? <ClusterEdit
                    isNewCluster={true}
                    cluster={tempCluster}
                    onSave={this.addCluster.bind(this)}
                    onCancel={this.backToClustersView.bind(this)}
                  />
                : <ClusterSeedModal
                    onNext={this.createCluster.bind(this)}
                    onCancel={this.backToClustersView.bind(this)}
                    clusters={settings.clusters}
                  />
              }
            </Route>

            <Route fragment=":clusterId" inflate={inflateCluster}>
              <ClusterEdit onSave={this.updateCluster.bind(this)}/>
            </Route>
          </Route>

          <Route fragment="data-cubes">
            <DataCubes settings={settings} onSave={this.onSave.bind(this)}/>

            <Route fragment="new-data-cube">
              { tempDataCube ? null : <DataCubes settings={settings} onSave={this.onSave.bind(this)}/> }

              { tempDataCube
                ? <DataCubeEdit
                    clusters={settings.clusters}
                    isNewDataCube={true}
                    dataCube={tempDataCube}
                    onSave={this.addDataCube.bind(this)}
                    onCancel={this.backToDataCubesView.bind(this)}
                  />
                : <DataCubeSeedModal
                    onNext={this.createDataCube.bind(this)}
                    onCancel={this.backToDataCubesView.bind(this)}
                    dataCubes={settings.dataCubes}
                    clusters={settings.clusters}
                  />
              }
            </Route>

            <Route fragment=":dataCubeId/:tab=general"  inflate={inflateDataCube}>
              <DataCubeEdit onSave={this.updateDataCube.bind(this)} clusters={settings.clusters}/>
            </Route>

          </Route>
        </Router>
      </div>
     </div>;
  }
}
