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

import React from "react";
import { Fn } from "../../../common/utils/general/general";
import { STRINGS } from "../../config/constants";
import { BubbleTitle } from "../bubble-title/bubble-title";
import { Button } from "../button/button";
import { ModalBubble } from "../modal-bubble/modal-bubble";
import "./highlight-modal.scss";

interface HighlightModalProps {
  title: string;
  left: number;
  top: number;
  dropHighlight: Fn;
  acceptHighlight: Fn;
}

export const HighlightModal: React.FunctionComponent<HighlightModalProps> = ({ title, children, left, top, acceptHighlight, dropHighlight }) =>
  <ModalBubble className="highlight-modal" left={left} top={top} onClose={dropHighlight}>
    <BubbleTitle title={title} />
    <div className="value">{children}</div>
    <div className="actions">
      <Button type="primary" className="accept mini" onClick={acceptHighlight} title={STRINGS.select} />
      <Button type="secondary" className="drop mini" onClick={dropHighlight} title={STRINGS.cancel} />
    </div>
  </ModalBubble>;
