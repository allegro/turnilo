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

require('./remove-modal.css');

import * as React from 'react';
import { Fn } from '../../../../common/utils/general/general';
import { classNames, enterKey } from '../../../utils/dom/dom';


import { SvgIcon } from '../../../components/svg-icon/svg-icon';
import { FormLabel } from '../../../components/form-label/form-label';
import { Button } from '../../../components/button/button';
import { ImmutableInput } from '../../../components/immutable-input/immutable-input';
import { Modal } from '../../../components/modal/modal';

export interface RemoveModalProps extends React.Props<any> {
  itemTitle?: string;
  onOK: () => void;
  onCancel: () => void;
}

export interface RemoveModalState {
}

export class RemoveModal extends React.Component<RemoveModalProps, RemoveModalState> {
  private hasInitialized = false;

  constructor() {
    super();
    this.state = {};
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  componentDidMount() {
    window.addEventListener('keydown', this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.globalKeyDownListener);
  }

  globalKeyDownListener(e: KeyboardEvent) {
  }

  render(): JSX.Element {
    const { itemTitle } = this.props;

    return <Modal
      className="remove-modal"
      title={`Delete "${itemTitle}"`}
      onClose={this.props.onCancel}
    >
      <p>Are you sure you would like to delete the data cube "{itemTitle}"?</p>
      <p>This action is not reversible.</p>

      <div className="buttons">
        <Button className="delete" title="Delete" type="warn" onClick={this.props.onOK}/>
        <Button className="cancel" title="Cancel" type="secondary" onClick={this.props.onCancel}/>
      </div>

    </Modal>;
  }

}
