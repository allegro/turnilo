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

require('./clusters.css');

import * as React from 'react';
import { Fn } from '../../../../common/utils/general/general';
import { firstUp } from '../../../../common/utils/string/string';
import { classNames } from '../../../utils/dom/dom';

import { SvgIcon } from '../../../components/svg-icon/svg-icon';
import { FormLabel } from '../../../components/form-label/form-label';
import { Button } from '../../../components/button/button';

import { AppSettings, Cluster } from '../../../../common/models/index';

import { SimpleTable, SimpleTableColumn, SimpleTableAction } from '../../../components/simple-table/simple-table';

export interface ClustersProps extends React.Props<any> {
  settings?: AppSettings;
  onSave?: (settings: AppSettings) => void;
}

export interface ClustersState {
  newSettings?: AppSettings;
  hasChanged?: boolean;
}

export class Clusters extends React.Component<ClustersProps, ClustersState> {
  constructor() {
    super();

    this.state = {hasChanged: false};
  }

  componentWillReceiveProps(nextProps: ClustersProps) {
    if (nextProps.settings) this.setState({
      newSettings: nextProps.settings,
      hasChanged: false
    });
  }

  save() {
    if (this.props.onSave) {
      this.props.onSave(this.state.newSettings);
    }
  }

  editCluster(cluster: Cluster) {
    window.location.hash += `/${cluster.name}`;
  }

  renderEmpty(): JSX.Element {
    return <div className="clusters empty">
      <div className="title">No clusters</div>
      <div className="subtitle">(the only data cube type available is 'native')</div>
    </div>;
  }

  render() {
    const { hasChanged, newSettings } = this.state;

    if (!newSettings) return null;

    if (!newSettings.clusters.length) return this.renderEmpty();

    const columns: SimpleTableColumn[] = [
      {label: 'Name', field: 'name', width: 200, cellIcon: 'full-cluster'},
      {label: 'Host', field: 'host', width: 200},
      {label: 'Strategy', field: 'introspectionStrategy', width: 300}
    ];

    const actions: SimpleTableAction[] = [
      {icon: 'full-edit', callback: this.editCluster.bind(this)}
    ];

    return <div className="clusters">
      <div className="title-bar">
        <div className="title">Clusters</div>
        {hasChanged ? <Button className="save" title="Save" type="primary" onClick={this.save.bind(this)}/> : null}
      </div>
      <div className="content">
        <SimpleTable
          columns={columns}
          rows={newSettings.clusters}
          actions={actions}
          onRowClick={this.editCluster.bind(this)}
        ></SimpleTable>
      </div>
    </div>;
  }
}
