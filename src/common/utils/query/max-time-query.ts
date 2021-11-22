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

import { $, Dataset, Executor, ply, RefExpression } from "plywood";
import { QueryableDataCube } from "../../models/data-cube/queryable-data-cube";

export function maxTimeQueryForCube({ timeAttribute, executor }: QueryableDataCube): Promise<Date> {
  return maxTimeQuery(timeAttribute, executor);
}

export function maxTimeQuery(timeAttribute?: RefExpression, executor?: Executor): Promise<Date> {
  if (!executor) {
    return Promise.reject(new Error("dataCube not ready"));
  }

  const ex = ply().apply("maxTime", $("main").max(timeAttribute));

  return executor(ex).then((dataset: Dataset) => {
    const maxTimeDate = dataset.data[0]["maxTime"] as Date;
    if (isNaN(maxTimeDate as any)) return null;
    return maxTimeDate;
  });
}
