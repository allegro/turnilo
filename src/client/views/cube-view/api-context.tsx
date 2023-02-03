/*
 * Copyright 2017-2022 Allegro.pl
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

import { Dataset, DatasetJS } from "plywood";
import React, { useContext } from "react";
import { ClientAppSettings } from "../../../common/models/app-settings/app-settings";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { Binary, Unary } from "../../../common/utils/functional/functional";
import { DEFAULT_VIEW_DEFINITION_VERSION, definitionConverters } from "../../../common/view-definitions";
import { Ajax } from "../../utils/ajax/ajax";

export type VisualizationQuery = Unary<Essence, Promise<Dataset>>;

export type BooleanFilterQuery = Binary<Essence, Dimension, Promise<Dataset>>;

export interface ApiContextValue {
  visualizationQuery: VisualizationQuery;
  booleanFilterQuery: BooleanFilterQuery;
}

export const ApiContext = React.createContext<ApiContextValue>({
  get booleanFilterQuery(): BooleanFilterQuery {
    throw new Error("Attempted to consume ApiContext when there was no Provider");
  },
  get visualizationQuery(): VisualizationQuery {
    throw new Error("Attempted to consume ApiContext when there was no Provider");
  }
});

export function useApiContext(): ApiContextValue {
  return useContext(ApiContext);
}

function createVizQueryApi({ clientTimeout: timeout, oauth }: ClientAppSettings): VisualizationQuery {
  const viewDefinitionVersion = DEFAULT_VIEW_DEFINITION_VERSION;
  const converter = definitionConverters[viewDefinitionVersion];
  return (essence: Essence) => {
    const { dataCube: { name } } = essence;
    const viewDefinition = converter.toViewDefinition(essence);
    return Ajax.query<{ result: DatasetJS }>({
      method: "POST",
      url: "query/visualization",
      timeout,
      data: {
        viewDefinitionVersion,
        dataCube: name,
        viewDefinition
      }
    }, oauth).then(res => Dataset.fromJS(res.result));
  };
}

function createBooleanFilterQuery({ clientTimeout: timeout, oauth }: ClientAppSettings): BooleanFilterQuery {
  const viewDefinitionVersion = DEFAULT_VIEW_DEFINITION_VERSION;
  const converter = definitionConverters[viewDefinitionVersion];
  return (essence: Essence, dimension: Dimension) => {
    const { dataCube: { name } } = essence;
    const viewDefinition = converter.toViewDefinition(essence);
    return Ajax.query<{ result: DatasetJS }>({
      method: "POST",
      url: "query/boolean-filter",
      timeout,
      data: {
        viewDefinitionVersion,
        dimension: dimension.name,
        dataCube: name,
        viewDefinition
      }
    }, oauth).then(res => Dataset.fromJS(res.result));
  };
}

function createApi(settings: ClientAppSettings): ApiContextValue {
  return {
    booleanFilterQuery: createBooleanFilterQuery(settings),
    visualizationQuery: createVizQueryApi(settings)
  };
}

interface ApiContextProviderProps {
  appSettings: ClientAppSettings;
}

export const CreateApiContext: React.FunctionComponent<ApiContextProviderProps> = ({ children, appSettings }) => {
  const value = createApi(appSettings);
  return <ApiContext.Provider value={value}>
    {children}
  </ApiContext.Provider>;
};
