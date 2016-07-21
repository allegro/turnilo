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
import { Fn } from '../../../../common/utils/general/general';
import { classNames, enterKey } from '../../../utils/dom/dom';
import { List } from 'immutable';

import { SvgIcon } from '../../../components/svg-icon/svg-icon';
import { FormLabel } from '../../../components/form-label/form-label';
import { Button } from '../../../components/button/button';
import { ImmutableInput } from '../../../components/immutable-input/immutable-input';
import { Modal } from '../../../components/modal/modal';
import { ImmutableDropdown } from '../../../components/immutable-dropdown/immutable-dropdown';

import { Dimension, ListItem, granularityFromJS, granularityToString } from '../../../../common/models/index';

import { DIMENSION_EDIT as LABELS } from '../utils/labels';


export interface DimensionModalProps extends React.Props<any> {
  dimensions?: List<Dimension>;
  dimension?: Dimension;
  onSave?: (dimension: Dimension) => void;
  onClose?: () => void;
  isCreating?: boolean;
}

export interface DimensionModalState {
  newDimension?: Dimension;
  canSave?: boolean;
  errors?: any;
}

export class DimensionModal extends React.Component<DimensionModalProps, DimensionModalState> {
  static KINDS: ListItem[] = [
    {label: 'Time', value: 'time'},
    {label: 'String', value: 'string'},
    {label: 'Boolean', value: 'boolean'},
    {label: 'String-geo', value: 'string-geo'}
  ];

  constructor() {
    super();
    this.state = {
      canSave: false,
      errors: {}
    };
  }

  initStateFromProps(props: DimensionModalProps) {
    if (props.dimension) {
      this.setState({
        newDimension: new Dimension(props.dimension.valueOf()),
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

  onChange(newDimension: Dimension, isValid: boolean, path: string, error: string) {
    var { errors } = this.state;

    errors[path] = isValid ? false : error;

    var canSave = true;
    for (let key in errors) canSave = canSave && (errors[key] === false);

    if (isValid) {
      this.setState({
        newDimension,
        errors,
        canSave: canSave && !this.props.dimension.equals(newDimension)
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
    this.props.onSave(this.state.newDimension);
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
    const { newDimension, canSave, errors } = this.state;

    if (!newDimension) return null;

    const isTime = newDimension.kind === 'time';

    var makeLabel = FormLabel.simpleGenerator(LABELS, errors, true);
    var makeTextInput = ImmutableInput.simpleGenerator(newDimension, this.onChange.bind(this));
    var makeDropDownInput = ImmutableDropdown.simpleGenerator(newDimension, this.onChange.bind(this));

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
          instance={newDimension}
          path={'granularities'}
          onChange={this.onChange.bind(this)}

          valueToString={(value: any) => value ? value.map(granularityToString).join(', ') : undefined}
          stringToValue={(str: string) => str.split(/\s*,\s*/).map(granularityFromJS)}
        /> : null}

      </form>

      <div className="button-group">
        <Button className={classNames("save", {disabled: !canSave})} title="Save" type="primary" onClick={this.save.bind(this)}/>
        <Button className="cancel" title="Cancel" type="secondary" onClick={this.props.onClose}/>
      </div>

    </Modal>;
  }

}
