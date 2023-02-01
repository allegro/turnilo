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
import { Essence } from "../../../common/models/essence/essence";
import { Unary } from "../../../common/utils/functional/functional";
import { DEFAULT_VIEW_DEFINITION_VERSION, definitionConverters } from "../../../common/view-definitions";
import { Ajax } from "../../utils/ajax/ajax";

export type QueryCall = Unary<Essence, Promise<Dataset>>;

interface ApiContextValue {
  query: QueryCall;
}

const InternalApiContext = React.createContext<ApiContextValue>({
  get query(): QueryCall {
    throw new Error("Attempted to consume ApiContext when there was no Provider");
  }
});

export function useApiContext(): ApiContextValue {
  return useContext(InternalApiContext);
}

function createQueryApi({ clientTimeout: timeout, oauth }: ClientAppSettings): QueryCall {
  const viewDefinitionVersion = DEFAULT_VIEW_DEFINITION_VERSION;
  const converter = definitionConverters[viewDefinitionVersion];
  return (essence: Essence) => {
    const { dataCube: { name } } = essence;
    const viewDefinition = converter.toViewDefinition(essence);
    return Ajax.query<{ result: DatasetJS }>({
      method: "POST",
      url: "query",
      timeout,
      data: {
        viewDefinitionVersion,
        dataCube: name,
        viewDefinition
      }
    }, oauth).then(res => Dataset.fromJS(res.result));
  };
}

interface ApiContextProviderProps {
  appSettings: ClientAppSettings;
}

const Provider: React.FunctionComponent<ApiContextProviderProps> = ({ children, appSettings }) => {
  const value = { query: createQueryApi(appSettings) };
  return <InternalApiContext.Provider value={value}>
    {children}
  </InternalApiContext.Provider>;
};

export const ApiContext = {
  Provider,
  Consumer: InternalApiContext.Consumer
};
