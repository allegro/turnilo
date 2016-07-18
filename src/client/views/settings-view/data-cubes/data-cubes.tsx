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

import { SvgIcon } from '../../../components/svg-icon/svg-icon';
import { FormLabel } from '../../../components/form-label/form-label';
import { Button } from '../../../components/button/button';

import { AppSettings, Cluster, DataCube} from '../../../../common/models/index';

import { SimpleTable, SimpleTableColumn, SimpleTableAction } from '../../../components/simple-table/simple-table';

export interface DataCubesProps extends React.Props<any> {
  settings?: AppSettings;
  onSave?: (settings: AppSettings, message?: string) => void;
}

export interface DataCubesState {
  newSettings?: AppSettings;
  hasChanged?: boolean;
}

export class DataCubes extends React.Component<DataCubesProps, DataCubesState> {
  constructor() {
    super();

    this.state = {};
  }

  componentWillReceiveProps(nextProps: DataCubesProps) {
    if (nextProps.settings) this.setState({
      newSettings: nextProps.settings
    });
  }

  editCube(cube: DataCube) {
    window.location.hash += `/${cube.name}`;
  }

  removeCube(cube: DataCube) {
    // var index = this.state.newSettings.dataCubes.indexOf(cube);

    // if (index < 0) return;

    // var newCubes = this.state.newSettings.dataCubes.splice(index, 1);

    // this.setState({
    //   newSettings: this.state.newSettings.changedDataCubes(newCubes)
    // })
  }

  createCube() {
    var dataCubes = this.state.newSettings.dataCubes;
    dataCubes.push(DataCube.fromJS({
      name: 'new-datacube',
      clusterName: 'druid',
      source: 'new-source'
    }));

    this.props.onSave(
      this.state.newSettings.changeDataCubes(dataCubes),
      'Cube added'
    );
  }

  render() {
    const { newSettings } = this.state;

    if (!newSettings) return null;

    const columns: SimpleTableColumn[] = [
      {label: 'Name', field: 'title', width: 170, cellIcon: 'full-cube'},
      {label: 'Source', field: 'source', width: 400},
      {label: 'Dimensions', field: (cube: DataCube) => cube.dimensions.size, width: 120},
      {label: 'Measures', field: (cube: DataCube) => cube.measures.size, width: 80}
    ];

    const actions: SimpleTableAction[] = [
      {icon: 'full-edit', callback: this.editCube.bind(this)},
      {icon: 'full-remove', callback: this.removeCube.bind(this)}
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
    </div>;
  }
}
