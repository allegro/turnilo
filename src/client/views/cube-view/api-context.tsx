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
import { StringFilterClause } from "../../../common/models/filter-clause/filter-clause";
import { Split } from "../../../common/models/split/split";
import { Binary, Nullary, Ternary, Unary } from "../../../common/utils/functional/functional";
import { DEFAULT_VIEW_DEFINITION_VERSION, definitionConverters } from "../../../common/view-definitions";
import { filterDefinitionConverter } from "../../../common/view-definitions/version-4/filter-definition";
import { splitConverter } from "../../../common/view-definitions/version-4/split-definition";
import { Ajax } from "../../utils/ajax/ajax";

export type VisualizationQuery = Unary<Essence, Promise<Dataset>>;

export type PinboardQuery = Ternary<Essence, StringFilterClause | null, Split, Promise<Dataset>>;

export type RawDataQuery = Unary<Essence, Promise<Dataset>>;

export type BooleanFilterQuery = Binary<Essence, Dimension, Promise<Dataset>>;

export type StringFilterQuery = Binary<Essence, StringFilterClause, Promise<Dataset>>;

export type NumberFilterQuery = Binary<Essence, Dimension, Promise<Dataset>>;

export interface ApiContextValue {
  visualizationQuery: VisualizationQuery;
  booleanFilterQuery: BooleanFilterQuery;
  rawDataQuery: RawDataQuery;
  stringFilterQuery: StringFilterQuery;
  numberFilterQuery: NumberFilterQuery;
  pinboardQuery: PinboardQuery;
}

class ApiContextIllegalAccessError extends Error {
  constructor() {
    super("Attempted to consume ApiContext when there was no Provider");
  }
}

export const ApiContext = React.createContext<ApiContextValue>({
  get numberFilterQuery(): NumberFilterQuery {
    throw new ApiContextIllegalAccessError();
  },
  get booleanFilterQuery(): BooleanFilterQuery {
    throw new ApiContextIllegalAccessError();
  },
  get visualizationQuery(): VisualizationQuery {
    throw new ApiContextIllegalAccessError();
  },
  get rawDataQuery(): RawDataQuery {
    throw new ApiContextIllegalAccessError();
  },
  get pinboardQuery(): PinboardQuery {
    throw new ApiContextIllegalAccessError();
  },
  get stringFilterQuery(): StringFilterQuery {
    throw new ApiContextIllegalAccessError();
  }
});

export function useApiContext(): ApiContextValue {
  return useContext(ApiContext);
}

interface QueryResponse {
  result: DatasetJS;
}

type QueryEndpoints = "visualization" | "pinboard" | "boolean-filter" | "string-filter" | "number-filter" | "raw-data";

type ExtraParams = Record<string, unknown>;

type SerializeExtraBase = (...args: any[]) => ExtraParams;
type QueryFunction<T extends SerializeExtraBase> = (essence: Essence, ...args: Parameters<T>) => Promise<Dataset>;

const emptyParams: Nullary<ExtraParams> = () => ({});

function createApiCall<T extends SerializeExtraBase>(settings: ClientAppSettings, query: QueryEndpoints, serializeExtraParams: T): QueryFunction<T> {
  const { oauth, clientTimeout: timeout } = settings;
  const converter = definitionConverters[DEFAULT_VIEW_DEFINITION_VERSION];
  return (essence: Essence, ...args: Parameters<T>) => {
    const extra = serializeExtraParams(...args);
    const { dataCube: { name } } = essence;
    const viewDefinition = converter.toViewDefinition(essence);
    return Ajax.query<QueryResponse>({
      method: "POST",
      url: `query/${query}`,
      timeout,
      data: {
        dataCube: name,
        viewDefinition,
        ...extra
      }
    }, oauth).then(constructDataset);
  };
}

const constructDataset = (res: QueryResponse) => Dataset.fromJS(res.result);

function createVizQueryApi(settings: ClientAppSettings): VisualizationQuery {
  return createApiCall(settings, "visualization", emptyParams);
}

function createNumberFilterQuery(settings: ClientAppSettings): NumberFilterQuery {
  return createApiCall(settings, "number-filter", (dimension: Dimension) => ({ dimension: dimension.name }));
}

function createBooleanFilterQuery(settings: ClientAppSettings): BooleanFilterQuery {
  return createApiCall(settings, "boolean-filter", (dimension: Dimension) => ({ dimension: dimension.name }));
}

function createStringFilterQuery(settings: ClientAppSettings): StringFilterQuery {
  return createApiCall(settings, "string-filter", (clause: StringFilterClause) => {
    const clauseJS = filterDefinitionConverter.fromFilterClause(clause);
    return ({ clause: clauseJS });
  });
}

function createPinboardQuery(settings: ClientAppSettings): PinboardQuery {
  return createApiCall(settings, "pinboard", (clause: StringFilterClause | null, split: Split) => {
    const clauseJS = clause && filterDefinitionConverter.fromFilterClause(clause);
    const splitJS = splitConverter.fromSplitCombine(split);
    return ({ clause: clauseJS, split: splitJS });
  });
}

function createRawDataQueryApi(settings: ClientAppSettings): RawDataQuery {
  return createApiCall(settings, "raw-data", emptyParams);
}

function createApi(settings: ClientAppSettings): ApiContextValue {
  return {
    pinboardQuery: createPinboardQuery(settings),
    numberFilterQuery: createNumberFilterQuery(settings),
    booleanFilterQuery: createBooleanFilterQuery(settings),
    visualizationQuery: createVizQueryApi(settings),
    rawDataQuery: createRawDataQueryApi(settings),
    stringFilterQuery: createStringFilterQuery(settings)
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
