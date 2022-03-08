/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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

import React from "react";
import { Fn } from "../../../common/utils/general/general";
import { Button } from "../../components/button/button";
import { Modal } from "../../components/modal/modal";
import { STRINGS } from "../../config/constants";
import "./about-modal.scss";

export interface AboutModalProps {
  version: string;
  onClose: Fn;
}

export interface AboutModalState {
}

export class AboutModal extends React.Component<AboutModalProps, AboutModalState> {

  render() {
    const { version, onClose } = this.props;

    return <Modal
      className="about-modal"
      title="About Turnilo"
      onClose={onClose}
    >
      <div className="p-group">
        <p>
          <a href="https://github.com/allegro/turnilo" target="_blank">Turnilo</a> (version {version}) is open source under
          the <a href="https://github.com/allegro/turnilo/blob/master/LICENSE" target="_blank">Apache 2.0</a> license.
        </p>
        <p>
          For bug reports, feedback or support please create an issue on <a href="https://github.com/allegro/turnilo/issues"
                                                                            target="_blank">GitHub</a>.
        </p>
      </div>
      <div className="button-bar">
        <Button type="primary" onClick={onClose} title={STRINGS.close} />
      </div>
    </Modal>;
  }
}
