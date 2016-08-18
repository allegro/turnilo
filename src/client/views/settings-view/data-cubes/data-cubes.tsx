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

require('./data-cubes.css');

import * as React from 'react';
import { Fn } from '../../../../common/utils/general/general';
import { classNames } from '../../../utils/dom/dom';

import { AppSettings, Cluster, DataCube} from '../../../../common/models/index';

import { SimpleTable, SimpleTableColumn, SimpleTableAction, SvgIcon, FormLabel, Button } from '../../../components/index';
import { RemoveModal } from '../../../modals/index';

export interface DataCubesProps extends React.Props<any> {
  settings?: AppSettings;
  onSave?: (settings: AppSettings, message?: string) => void;
}

export interface DataCubesState {
  newSettings?: AppSettings;
  hasChanged?: boolean;
  pendingDeletion?: DataCube;
}

export class DataCubes extends React.Component<DataCubesProps, DataCubesState> {
  constructor() {
    super();

    this.state = {};
  }

  componentWillReceiveProps(nextProps: DataCubesProps) {
    if (nextProps.settings) this.setState({
      newSettings: nextProps.settings,
      hasChanged: false,
      pendingDeletion: undefined
    });
  }

  editCube(cube: DataCube) {
    window.location.hash += `/${cube.name}`;
  }

  askForCubeRemoval(cube: DataCube) {
    this.setState({pendingDeletion: cube});
  }

  cancelRemoval() {
    this.setState({pendingDeletion: undefined});
  }

  removeCube() {
    var cube = this.state.pendingDeletion;

    var settings: AppSettings = this.state.newSettings;
    var index = settings.dataCubes.indexOf(cube);

    if (index < 0) return;

    var newCubes = settings.dataCubes;
    newCubes.splice(index, 1);

    this.props.onSave(settings.changeDataCubes(newCubes), 'Cube removed');
  }

  createCube() {
    var settings: AppSettings = this.state.newSettings;

    var newCube = DataCube.fromJS({
      name: 'new-datacube',
      clusterName: settings.clusters.length > 0 ? settings.clusters[0].name : 'native',
      source: 'new-source'
    });

    this.props.onSave(settings.addDataCube(newCube), 'Cube added');
  }

  renderEmpty(): JSX.Element {
    return <div className="data-cubes empty">
      <div className="title">No data cubes</div>
      <div className="subtitle actionable" onClick={this.createCube.bind(this)}>Create a new data cube</div>
    </div>;
  }

  render() {
    const { newSettings, pendingDeletion } = this.state;

    if (!newSettings) return null;

    if (!newSettings.dataCubes.length) return this.renderEmpty();

    const columns: SimpleTableColumn[] = [
      {label: 'Name', field: 'title', width: 170, cellIcon: 'full-cube'},
      {label: 'Source', field: 'source', width: 400},
      {label: 'Dimensions', field: (cube: DataCube) => cube.dimensions.size, width: 120},
      {label: 'Measures', field: (cube: DataCube) => cube.measures.size, width: 80}
    ];

    const actions: SimpleTableAction[] = [
      {icon: 'full-edit', callback: this.editCube.bind(this)},
      {icon: 'full-remove', callback: this.askForCubeRemoval.bind(this)}
    ];

    return <div className="data-cubes">
      <div className="title-bar">
        <div className="title">Data Cubes</div>
        <Button className="save" title="Add a cube" type="primary" onClick={this.createCube.bind(this)}/>
      </div>
      <div className="content">
        <SimpleTable
          columns={columns}
          rows={newSettings.dataCubes}
          actions={actions}
          onRowClick={this.editCube.bind(this)}
        ></SimpleTable>
      </div>
      {pendingDeletion ? <RemoveModal
        itemTitle={pendingDeletion.title}
        onOK={this.removeCube.bind(this)}
        onCancel={this.cancelRemoval.bind(this)}
      /> : null}
    </div>;
  }
}
