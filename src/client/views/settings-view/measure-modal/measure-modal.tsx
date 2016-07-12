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

require('./measure-modal.css');

import * as React from 'react';
import { Fn } from '../../../../common/utils/general/general';
import { classNames, enterKey } from '../../../utils/dom/dom';


import { SvgIcon } from '../../../components/svg-icon/svg-icon';
import { FormLabel } from '../../../components/form-label/form-label';
import { Button } from '../../../components/button/button';
import { ImmutableInput } from '../../../components/immutable-input/immutable-input';
import { Modal } from '../../../components/modal/modal';

import { Measure } from '../../../../common/models/index';


export interface MeasureModalProps extends React.Props<any> {
  measure?: Measure;
  onSave?: (measure: Measure) => void;
  onClose?: () => void;
}

export interface MeasureModalState {
  newMeasure?: Measure;
  canSave?: boolean;
}

export class MeasureModal extends React.Component<MeasureModalProps, MeasureModalState> {
  private hasInitialized = false;

  constructor() {
    super();
    this.state = {canSave: false};
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  initStateFromProps(props: MeasureModalProps) {
    if (props.measure) {
      this.setState({
        newMeasure: new Measure(props.measure.valueOf()),
        canSave: true
      });
    }
  }

  componentWillReceiveProps(nextProps: MeasureModalProps) {
    this.initStateFromProps(nextProps);
  }

  componentDidMount() {
    this.initStateFromProps(this.props);
    window.addEventListener('keydown', this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.globalKeyDownListener);
  }

  componentDidUpdate() {
    if (!this.hasInitialized && !!this.refs['name-input']) {
      (this.refs['name-input'] as any).focus();
      this.hasInitialized = true;
    }
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (enterKey(e) && this.state.canSave) {
      this.save();
    }
  }

  onChange(newMeasure: Measure, isValid: boolean) {
    if (isValid) {
      this.setState({
        newMeasure,
        canSave: !this.props.measure.equals(newMeasure)
      });
    } else {
      this.setState({canSave: false});
    }
  }

  save() {
    this.props.onSave(this.state.newMeasure);
  }

  render(): JSX.Element {
    const { newMeasure, canSave } = this.state;

    if (!newMeasure) return null;

    return <Modal
      className="dimension-modal"
      title={newMeasure.title}
      onClose={this.props.onClose}
    >
      <form className="general vertical">
        <FormLabel label="Title"></FormLabel>
        <ImmutableInput
          focusOnStartUp={true}
          instance={newMeasure}
          path={'title'}
          onChange={this.onChange.bind(this)}
          validator={/^.+$/}
        />
      </form>

      <div className="button-group">
        {canSave ? <Button className="save" title="Save" type="primary" onClick={this.save.bind(this)}/> : null}
        <Button className="cancel" title="Cancel" type="secondary" onClick={this.props.onClose}/>
      </div>

    </Modal>;
  }

}
