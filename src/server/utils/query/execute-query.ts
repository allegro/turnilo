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
import { Timezone } from "chronoshift";
import { Dataset, DatasetJS, Expression } from "plywood";
import { QueryableDataCube } from "../../../common/models/data-cube/queryable-data-cube";
import { AppliedQueryDecorator } from "../query-decorator-loader/get-query-decorator";

export async function executeQuery(dataCube: QueryableDataCube, query: Expression, timezone: Timezone | null, decorator: AppliedQueryDecorator): Promise<DatasetJS> {
  const maxQueries = dataCube.maxQueries;
  const expression = decorator(query);
  const data = await dataCube.executor(expression, { maxQueries, timezone });
  return Dataset.isDataset(data) ? data.toJS() : data as DatasetJS;
}
