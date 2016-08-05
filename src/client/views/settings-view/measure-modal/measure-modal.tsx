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
import { List } from 'immutable';

import { SvgIcon } from '../../../components/svg-icon/svg-icon';
import { FormLabel } from '../../../components/form-label/form-label';
import { Button } from '../../../components/button/button';
import { ImmutableInput } from '../../../components/immutable-input/immutable-input';
import { ImmutableDropdown } from '../../../components/immutable-dropdown/immutable-dropdown';
import { Modal } from '../../../components/modal/modal';

import { Measure } from '../../../../common/models/index';

import { MEASURE as LABELS } from '../../../../common/models/labels';


export interface MeasureModalProps extends React.Props<any> {
  measures?: List<Measure>;
  measure?: Measure;
  onSave?: (measure: Measure) => void;
  onClose?: () => void;
  isCreating?: boolean;
}

export interface MeasureModalState {
  newMeasure?: Measure;
  canSave?: boolean;
  errors?: any;
}

export class MeasureModal extends React.Component<MeasureModalProps, MeasureModalState> {
  private hasInitialized = false;

  constructor() {
    super();
    this.state = {
      canSave: false,
      errors: {}
    };
  }

  initStateFromProps(props: MeasureModalProps) {
    if (props.measure) {
      this.setState({
        newMeasure: new Measure(props.measure.valueOf()),
        canSave: false
      });
    }
  }

  componentWillReceiveProps(nextProps: MeasureModalProps) {
    this.initStateFromProps(nextProps);
  }

  componentDidMount() {
    this.initStateFromProps(this.props);
  }

  componentDidUpdate() {
    if (!this.hasInitialized && !!this.refs['name-input']) {
      (this.refs['name-input'] as any).focus();
      this.hasInitialized = true;
    }
  }

  onChange(newMeasure: Measure, isValid: boolean, path: string, error: string) {
    var { errors } = this.state;

    errors[path] = isValid ? false : error;

    var canSave = true;
    for (let key in errors) canSave = canSave && (errors[key] === false);

    if (isValid) {
      this.setState({
        errors,
        newMeasure,
        canSave: canSave && !this.props.measure.equals(newMeasure)
      });
    } else {
      this.setState({
        errors,
        canSave: false
      });
    }
  }

  save() {
    if (!this.state.canSave) return;
    this.props.onSave(this.state.newMeasure);
  }

  uniqueName(name: string): boolean {
    const { measures } = this.props;

    if (measures.find((m) => m.name === name)) {
      throw new Error(`Another measure with this name already exists`);
    }

    return true;
  }

  render(): JSX.Element {
    const { isCreating, measure } = this.props;
    const { newMeasure, canSave, errors } = this.state;

    if (!newMeasure) return null;

    var makeLabel = FormLabel.simpleGenerator(LABELS, errors, true);
    var makeTextInput = ImmutableInput.simpleGenerator(newMeasure, this.onChange.bind(this));
    var makeDropDownInput = ImmutableDropdown.simpleGenerator(newMeasure, this.onChange.bind(this));

    return <Modal
      className="dimension-modal"
      title={measure.title}
      onClose={this.props.onClose}
      onEnter={this.save.bind(this)}
    >
      <form className="general vertical">
        { isCreating ? makeLabel('name') : null }
        { isCreating ? makeTextInput('name', this.uniqueName.bind(this), isCreating) : null }

        {makeLabel('title')}
        {makeTextInput('title', /^.+$/, !isCreating)}

        {makeLabel('formula')}
        {makeTextInput('formula')}

      </form>

      <div className="buttons">
        <Button className={classNames("save", {disabled: !canSave})} title="OK" type="primary" onClick={this.save.bind(this)}/>
        <Button className="cancel" title="Cancel" type="secondary" onClick={this.props.onClose}/>
      </div>

    </Modal>;
  }

}
