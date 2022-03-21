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
import { ClientDataCube } from "../../../common/models/data-cube/data-cube";
import { Stage } from "../../../common/models/stage/stage";
import { Fn } from "../../../common/utils/general/general";
import { STRINGS } from "../../config/constants";
import { BubbleMenu } from "../bubble-menu/bubble-menu";

export interface DebugMenuProps {
  openOn: Element;
  onClose: Fn;
  openRawDataModal: Fn;
  openViewDefinitionModal: Fn;
  openDruidQueryModal: Fn;
  dataCube: ClientDataCube;
}

export const DebugMenu: React.FunctionComponent<DebugMenuProps> = ({ dataCube, openOn, onClose, openDruidQueryModal, openRawDataModal, openViewDefinitionModal }) => {

  const isNativeCluster = dataCube.clusterName === "native";

  function displayRawData() {
    openRawDataModal();
    onClose();
  }

  function displayViewDefinition() {
    openViewDefinitionModal();
    onClose();
  }

  function displayDruidQuery() {
    openDruidQueryModal();
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
      {!isNativeCluster && <li key="view-druid-query" onClick={displayDruidQuery}>
        {STRINGS.displayDruidQuery}
      </li>}
    </ul>
  </BubbleMenu>;
};
