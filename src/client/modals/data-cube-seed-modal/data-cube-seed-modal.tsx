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

require('./data-cube-seed-modal.css');

import * as React from 'react';
import { DataCube, Cluster } from "../../../common/models/index";

import { FormLabel, Button, Modal, ImmutableInput, ImmutableDropdown, Checkbox } from '../../components/index';
import { STRINGS } from "../../config/constants";
import { DATA_CUBE as LABELS } from '../../../common/models/labels';
import { generateUniqueName } from '../../../common/utils/string/string';
import { indexByAttribute } from '../../../common/utils/array/array';

import { ImmutableFormDelegate, ImmutableFormState } from '../../utils/immutable-form-delegate/immutable-form-delegate';

export interface DataCubeSeedModalProps extends React.Props<any> {
  onNext: (newDataCube: DataCube, autoFill: boolean) => void;
  onCancel: () => void;
  dataCubes: DataCube[];
  clusters: Cluster[];
}

export interface DataCubeSeedModalState extends ImmutableFormState<DataCube> {
  autoFill?: boolean;
}

export class DataCubeSeedModal extends React.Component<DataCubeSeedModalProps, DataCubeSeedModalState> {
  private delegate: ImmutableFormDelegate<DataCube>;

  constructor() {
    super();
    this.delegate = new ImmutableFormDelegate<DataCube>(this);
  }

  initFromProps(props: DataCubeSeedModalProps) {
    const { dataCubes, clusters } = props;

    if (!dataCubes) return;

    var clusterName = clusters.length ? clusters[0].name : 'native';

    this.setState({
      newInstance: new DataCube({
        name: generateUniqueName('dc', name => indexByAttribute(dataCubes, 'name', name) === -1),
        clusterName,
        source: ''
      })
    });
  }

  componentWillreceiveProps(nextProps: DataCubeSeedModalProps) {
    this.initFromProps(nextProps);
  }

  componentDidMount() {
    this.initFromProps(this.props);
  }

  onNext() {
    this.props.onNext(this.state.newInstance, this.state.autoFill);
  }

  toggleAutoFill() {
    this.setState({
      autoFill: !this.state.autoFill
    });
  }

  render(): JSX.Element {
    const { onNext, onCancel } = this.props;
    const { newInstance, errors, autoFill } = this.state;

    if (!newInstance) return null;

    var makeLabel = FormLabel.simpleGenerator(LABELS, errors, true);
    var makeTextInput = ImmutableInput.simpleGenerator(newInstance, this.delegate.onChange);
    var makeDropDownInput = ImmutableDropdown.simpleGenerator(newInstance, this.delegate.onChange);

    // TODO : find out what sources are available for the dropdown

    return <Modal
      className="data-cube-seed-modal"
      title={STRINGS.createDataCube}
      onClose={this.props.onCancel}
    >
      <form>
        {makeLabel('source')}
        {makeDropDownInput('source', [])}

        <Checkbox
          selected={autoFill}
          onClick={this.toggleAutoFill.bind(this)}
          label={STRINGS.autoFillDimensionsAndMeasures}
        />
      </form>
      <div className="button-bar">
        <Button type="primary" title={`${STRINGS.next}: ${STRINGS.configureDataCube}`} onClick={this.onNext.bind(this)}/>
        <Button className="cancel" title="Cancel" type="secondary" onClick={onCancel}/>
      </div>

    </Modal>;
  }
}
