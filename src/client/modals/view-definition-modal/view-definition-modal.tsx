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
import { Essence } from "../../../common/models/essence/essence";
import { Fn, makeTitle } from "../../../common/utils/general/general";
import { DEFAULT_VIEW_DEFINITION_VERSION, defaultDefinitionConverter } from "../../../common/view-definitions";
import { STRINGS } from "../../config/constants";
import { SourceModal } from "../source-modal/source-modal";
import "./view-definition-modal.scss";

export interface ViewDefinitionModalProps {
  onClose: Fn;
  essence: Essence;
}

const header = <React.Fragment>
  View definition for <a className="mkurl-link" target="_blank" href="https://github.com/allegro/turnilo/blob/master/docs/generating-links.md">mkurl</a>
</React.Fragment>;

export const ViewDefinitionModal: React.FunctionComponent<ViewDefinitionModalProps> = ({ essence, onClose }) => {

  const viewDefinition = {
    dataCubeName: essence.dataCube.name,
    viewDefinitionVersion: DEFAULT_VIEW_DEFINITION_VERSION,
    viewDefinition: defaultDefinitionConverter.toViewDefinition(essence)
  };
  const viewDefinitionAsJson = JSON.stringify(viewDefinition, null, 2);

  return <SourceModal
    onClose={onClose}
    header={header}
    title={`${makeTitle(STRINGS.viewDefinition)}`}
    source={viewDefinitionAsJson} />;
};
