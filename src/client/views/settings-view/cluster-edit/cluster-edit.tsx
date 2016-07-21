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

require('./cluster-edit.css');

import * as React from 'react';
import { List } from 'immutable';
import { Fn } from '../../../../common/utils/general/general';
import { classNames } from '../../../utils/dom/dom';
import { firstUp } from '../../../../common/utils/string/string';

import { FormLabel } from '../../../components/form-label/form-label';
import { Button } from '../../../components/button/button';
import { ImmutableInput } from '../../../components/immutable-input/immutable-input';
import { ImmutableDropdown } from '../../../components/immutable-dropdown/immutable-dropdown';

import { AppSettings, Cluster, ListItem } from '../../../../common/models/index';

import { CLUSTER_EDIT as LABELS } from '../utils/labels';

// Shamelessly stolen from http://stackoverflow.com/a/10006499
// (well, traded for an upvote)
const IP_REGEX = /^(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))$/;

const NUM_REGEX = /^\d+$/;

export interface ClusterEditProps extends React.Props<any> {
  settings: AppSettings;
  clusterId?: string;
  onSave: (settings: AppSettings) => void;
}

export interface ClusterEditState {
  tempCluster?: Cluster;
  hasChanged?: boolean;
  canSave?: boolean;
  cluster?: Cluster;
  errors?: any;
}

export class ClusterEdit extends React.Component<ClusterEditProps, ClusterEditState> {
  constructor() {
    super();

    this.state = {hasChanged: false, canSave: true, errors: {}};
  }

  componentWillReceiveProps(nextProps: ClusterEditProps) {
    if (nextProps.settings) {
      this.initFromProps(nextProps);
    }
  }

  initFromProps(props: ClusterEditProps) {
    let cluster = props.settings.clusters.filter((d) => d.name === props.clusterId)[0];

    this.setState({
      tempCluster: new Cluster(cluster.valueOf()),
      hasChanged: false,
      canSave: true,
      cluster,
      errors: {}
    });
  }

  cancel() {
    // Settings tempCluster to undefined resets the inputs
    this.setState({tempCluster: undefined}, () => this.initFromProps(this.props));
  }

  save() {
    const { settings } = this.props;
    const { tempCluster, cluster } = this.state;

    var newClusters = settings.clusters;
    newClusters[newClusters.indexOf(cluster)] = tempCluster;
    var newSettings = settings.changeClusters(newClusters);

    if (this.props.onSave) {
      this.props.onSave(newSettings);
    }
  }

  goBack() {
    const { clusterId } = this.props;
    var hash = window.location.hash;
    window.location.hash = hash.replace(`/${clusterId}`, '');
  }

  onSimpleChange(newCluster: Cluster, isValid: boolean, path: string, error: string) {
    const { cluster, errors } = this.state;

    errors[path] = isValid ? false : error;

    const hasChanged = !isValid || !cluster.equals(newCluster);

    var canSave = true;
    for (let key in errors) canSave = canSave && (errors[key] === false);

    if (isValid) {
      this.setState({
        tempCluster: newCluster,
        canSave,
        errors,
        hasChanged
      });
    } else {
      this.setState({
        canSave,
        errors,
        hasChanged
      });
    }
  }

  renderGeneral(): JSX.Element {
    const { tempCluster, errors } = this.state;

    var makeLabel = FormLabel.simpleGenerator(LABELS, errors);
    var makeTextInput = ImmutableInput.simpleGenerator(tempCluster, this.onSimpleChange.bind(this));
    var makeDropDownInput = ImmutableDropdown.simpleGenerator(tempCluster, this.onSimpleChange.bind(this));

    var isDruid = tempCluster.type === 'druid';
    var needsAuth = ['mysql', 'postgres'].indexOf(tempCluster.type) > -1;

    return <form className="general vertical">
      {makeLabel('host')}
      {makeTextInput('host', IP_REGEX, true)}

      {makeLabel('type')}
      {makeDropDownInput('type', Cluster.TYPE_VALUES.map(type => {return {value: type, label: type}; }))}

      {makeLabel('timeout')}
      {makeTextInput('timeout', NUM_REGEX)}

      {makeLabel('version')}
      {makeTextInput('version')}

      {makeLabel('sourceListScan')}
      {makeDropDownInput('sourceListScan', [{value: 'disable', label: 'Disable'}, {value: 'auto', label: 'Auto'}])}

      {makeLabel('sourceListRefreshOnLoad')}
      {makeDropDownInput('sourceListRefreshOnLoad', [{value: true, label: 'Enabled'}, {value: false, label: 'Disabled'}])}

      {makeLabel('sourceListRefreshInterval')}
      {makeTextInput('sourceListRefreshInterval', NUM_REGEX)}

      {makeLabel('sourceReintrospectOnLoad')}
      {makeDropDownInput('sourceReintrospectOnLoad', [{value: true, label: 'Enabled'}, {value: false, label: 'Disabled'}])}

      {makeLabel('sourceReintrospectInterval')}
      {makeTextInput('sourceReintrospectInterval', NUM_REGEX)}

      {isDruid ? makeLabel('introspectionStrategy') : null}
      {isDruid ? makeTextInput('introspectionStrategy') : null}

      {needsAuth ? makeLabel('database') : null}
      {needsAuth ? makeTextInput('database') : null}

      {needsAuth ? makeLabel('user') : null}
      {needsAuth ? makeTextInput('user') : null}

      {needsAuth ? makeLabel('password') : null}
      {needsAuth ? makeTextInput('password') : null}

    </form>;
  }

  renderButtons(): JSX.Element {
    const { hasChanged, canSave } = this.state;

    const cancelButton = <Button
      className="cancel"
      title="Revert changes"
      type="secondary"
      onClick={this.cancel.bind(this)}
    />;

    const saveButton = <Button
      className={classNames("save", {disabled: !canSave || !hasChanged})}
      title="Save"
      type="primary"
      onClick={this.save.bind(this)}
    />;

    if (!hasChanged) {
      return <div className="button-group">
        {saveButton}
      </div>;
    }

    return <div className="button-group">
      {cancelButton}
      {saveButton}
    </div>;
  }

  render() {
    const { tempCluster, hasChanged, canSave } = this.state;

    if (!tempCluster) return null;

    return <div className="cluster-edit">
      <div className="title-bar">
        <Button className="button back" type="secondary" svg={require('../../../icons/full-back.svg')} onClick={this.goBack.bind(this)}/>
        <div className="title">{tempCluster.name}</div>
        {this.renderButtons()}
      </div>
      <div className="content">
        {this.renderGeneral()}
      </div>

    </div>;
  }
}
