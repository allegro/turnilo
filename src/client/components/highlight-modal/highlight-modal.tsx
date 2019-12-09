/*
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

import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { STRINGS } from "../../config/constants";
import { BubbleTitle } from "../bubble-title/bubble-title";
import { Button } from "../button/button";
import { ModalBubble } from "../modal-bubble/modal-bubble";
import "./highlight-modal.scss";

interface HighlightModalProps {
  title: string;
  left: number;
  top: number;
  clicker: Clicker;
}

export class HighlightModal extends React.Component<HighlightModalProps, {}> {

  dropHighlight = () => {
    this.props.clicker.dropHighlight();
  }

  acceptHighlight = () => {
    this.props.clicker.acceptHighlight();
  }

  render() {
    const { title, children, left, top } = this.props;
    return <ModalBubble className="highlight-modal" left={left} top={top} onClose={this.dropHighlight}>
      <BubbleTitle title={title} />
      <div className="value">{children}</div>
      <div className="actions">
        <Button type="primary" className="accept mini" onClick={this.acceptHighlight} title={STRINGS.select} />
        <Button type="secondary" className="drop mini" onClick={this.dropHighlight} title={STRINGS.cancel} />
      </div>
    </ModalBubble>;
  }
}
