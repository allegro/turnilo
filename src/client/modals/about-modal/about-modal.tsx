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

require('./about-modal.css');

import * as React from 'react';
import { Fn } from '../../../common/utils/general/general';
import { STRINGS } from '../../config/constants';
import { Modal, Button } from '../../components/index';

export interface AboutModalProps extends React.Props<any> {
  version: string;
  onClose: Fn;
}

export interface AboutModalState {
}

export class AboutModal extends React.Component<AboutModalProps, AboutModalState> {

  constructor() {
    super();
  }

  render() {
    const { version, onClose } = this.props;

    return <Modal
      className="about-modal"
      title="About Swiv"
      onClose={onClose}
    >
      <div className="p-group">
        <p>
          <a href="https://github.com/yahoo/swiv" target='_blank'>Swiv</a> (version {version}) is open source under
          the <a href="https://github.com/yahoo/swiv/blob/master/LICENSE" target='_blank'>Apache 2.0</a> license.
        </p>
        <p>
          For bug reports, feedback or support please create an issue on <a href="https://github.com/yahoo/swiv/issues" target='_blank'>GitHub</a>.
        </p>
      </div>
      <div className="button-bar">
        <Button type="primary" onClick={onClose} title={STRINGS.close}/>
      </div>
    </Modal>;
  }
}
