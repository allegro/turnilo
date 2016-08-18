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

require('./dimension-modal.css');

import * as React from 'react';
import { Fn } from '../../../common/utils/general/general';
import { classNames, enterKey } from '../../utils/dom/dom';
import { List } from 'immutable';

import { SvgIcon, FormLabel, Button, ImmutableInput, Modal, ImmutableDropdown } from '../../components/index';

import { Dimension, ListItem, granularityFromJS, granularityToString } from '../../../common/models/index';

import { DIMENSION as LABELS } from '../../../common/models/labels';

import { ImmutableFormDelegate, ImmutableFormState } from '../../utils/immutable-form-delegate/immutable-form-delegate';


export interface DimensionModalProps extends React.Props<any> {
  dimensions?: List<Dimension>;
  dimension?: Dimension;
  onSave?: (dimension: Dimension) => void;
  onClose?: () => void;
  isCreating?: boolean;
}

export class DimensionModal extends React.Component<DimensionModalProps, ImmutableFormState<Dimension>> {
  static KINDS: ListItem[] = [
    {label: 'Time', value: 'time'},
    {label: 'String', value: 'string'},
    {label: 'Boolean', value: 'boolean'},
    {label: 'String-geo', value: 'string-geo'}
  ];

  static BUCKETING_STRATEGIES = [
    {label: 'Bucket', value: Dimension.defaultBucket},
    {label: 'Don’t Bucket', value: Dimension.defaultNoBucket}
  ];

  private delegate: ImmutableFormDelegate<Dimension>;

  constructor() {
    super();

    this.delegate = new ImmutableFormDelegate(this);
  }

  initStateFromProps(props: DimensionModalProps) {
    if (props.dimension) {
      this.setState({
        newInstance: new Dimension(props.dimension.valueOf()),
        canSave: false,
        errors: {}
      });
    }
  }

  componentWillReceiveProps(nextProps: DimensionModalProps) {
    this.initStateFromProps(nextProps);
  }

  componentDidMount() {
    this.initStateFromProps(this.props);
  }

  save() {
    if (!this.state.canSave) return;
    this.props.onSave(this.state.newInstance);
  }

  uniqueName(name: string): boolean {
    const { dimensions } = this.props;

    if (dimensions.find((m) => m.name === name)) {
      throw new Error(`Another dimension with this name already exists`);
    }

    return true;
  }

  render(): JSX.Element {
    const { isCreating, dimension } = this.props;
    const { newInstance, canSave, errors } = this.state;
    const saveButtonDisabled = !canSave || dimension.equals(newInstance);

    if (!newInstance) return null;

    const isTime = newInstance.kind === 'time';
    const isContinuous = newInstance.isContinuous();

    var makeLabel = FormLabel.simpleGenerator(LABELS, errors, true);
    var makeTextInput = ImmutableInput.simpleGenerator(newInstance, this.delegate.onChange);
    var makeDropDownInput = ImmutableDropdown.simpleGenerator(newInstance, this.delegate.onChange);

    return <Modal
      className="dimension-modal"
      title={dimension.title}
      onClose={this.props.onClose}
      onEnter={this.save.bind(this)}
    >
      <form className="general vertical">
        { isCreating ? makeLabel('name') : null }
        { isCreating ? makeTextInput('name', this.uniqueName.bind(this), isCreating) : null }

        {makeLabel('title')}
        {makeTextInput('title', /^.+$/, !isCreating)}

        {makeLabel('kind')}
        {makeDropDownInput('kind', DimensionModal.KINDS)}

        {makeLabel('formula')}
        {makeTextInput('formula')}

        {makeLabel('url')}
        {makeTextInput('url')}

        {isTime ? makeLabel('granularities') : null}
        {isTime ? <ImmutableInput
          instance={newInstance}
          path={'granularities'}
          onChange={this.delegate.onChange}

          valueToString={(value: any) => value ? value.map(granularityToString).join(', ') : undefined}
          stringToValue={(str: string) => str.split(/\s*,\s*/).map(granularityFromJS)}
        /> : null}

        {isContinuous ? makeLabel('bucketingStrategy') : null}
        {isContinuous ? makeDropDownInput('bucketingStrategy', DimensionModal.BUCKETING_STRATEGIES) : null}

      </form>

      <div className="button-bar">
        <Button className={classNames("save", {disabled: saveButtonDisabled})} title="OK" type="primary" onClick={this.save.bind(this)}/>
        <Button className="cancel" title="Cancel" type="secondary" onClick={this.props.onClose}/>
      </div>

    </Modal>;
  }

}
