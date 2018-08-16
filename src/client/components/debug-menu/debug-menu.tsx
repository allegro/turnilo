/*
 * Copyright 2017-2018 Allegro.pl
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
import { BubbleMenu } from "..";
import { Stage } from "../../../common/models";
import { Fn } from "../../../common/utils";
import { STRINGS } from "../../config/constants";

export interface DebugMenuProps {
  openOn: Element;
  onClose: Fn;
  openRawDataModal: Fn;
  openViewDefinitionModal: Fn;
}

export const DebugMenu: React.SFC<DebugMenuProps> = ({ openOn, onClose, openRawDataModal, openViewDefinitionModal }) => {

  function displayRawData() {
    openRawDataModal();
    onClose();
  }

  function displayViewDefinition() {
    openViewDefinitionModal();
    onClose();
  }

  return <BubbleMenu
    className="header-menu"
    direction="down"
    stage={Stage.fromSize(200, 200)}
    openOn={openOn}
    onClose={onClose}
  >
    <ul className="bubble-list">
      <li key="view-raw-data" onClick={displayRawData}>
        {STRINGS.displayRawData}
      </li>
      <li key="display-view-definition" onClick={displayViewDefinition}>
        {STRINGS.displayViewDefinition}
      </li>
    </ul>
  </BubbleMenu>;
};
