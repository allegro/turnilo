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
import { Essence } from "../../../common/models/essence/essence";
import { Fn, makeTitle } from "../../../common/utils/general/general";
import { DEFAULT_VIEW_DEFINITION_VERSION, defaultDefinitionConverter } from "../../../common/view-definitions";
import { STRINGS } from "../../config/constants";
import { SourceModal } from "../source-modal/source-modal";

export interface ViewDefinitionModalProps {
  onClose: Fn;
  essence: Essence;
}

export const ViewDefinitionModal: React.SFC<ViewDefinitionModalProps> = () => {

  const { essence, onClose } = this.props;
  const viewDefinition = {
    dataCubeName: essence.dataCube.name,
    viewDefinitionVersion: DEFAULT_VIEW_DEFINITION_VERSION,
    viewDefinition: defaultDefinitionConverter.toViewDefinition(essence)
  };
  const viewDefinitionAsJson = JSON.stringify(viewDefinition, null, 2);

  return <SourceModal
    onClose={onClose}
    header={STRINGS.viewDefinitionSubtitle}
    title={`${makeTitle(STRINGS.viewDefinition)}`}
    source={viewDefinitionAsJson} />;
};
