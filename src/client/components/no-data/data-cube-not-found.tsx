/*
 * Copyright 2017-2021 Allegro.pl
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
import { ClientCustomization } from "../../../common/models/customization/customization";
import { navigateToHome } from "../../applications/turnilo-application/view";
import { STRINGS } from "../../config/constants";
import { MarkdownNode } from "../markdown-node/markdown-node";
import { MessagePanel, MessagePanelAction } from "../message-panel/message-panel";

interface DataCubeNotFoundProps {
  customization: ClientCustomization;
}

export const DataCubeNotFound: React.FunctionComponent<DataCubeNotFoundProps> = ({ customization }) => {
  const { dataCubeNotFound } = customization.messages;
  const message = dataCubeNotFound && <MarkdownNode markdown={dataCubeNotFound} />;
  return <MessagePanel title={STRINGS.noDataCube} message={message}>
    <MessagePanelAction action={navigateToHome}
                        label="Go back to data cubes list"/>
  </MessagePanel>;
};
