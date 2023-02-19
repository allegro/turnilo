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
import { Response } from "express";
import { $, Expression } from "plywood";
import { Essence } from "../../../../common/models/essence/essence";
import { LIMIT } from "../../../../common/models/raw-data-modal/raw-data-modal";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { executeQuery } from "../../../utils/query/execute-query";
import { QueryRouterRequest } from "../query";

function getQuery(essence: Essence, timekeeper: Timekeeper): Expression {
  const { dataCube } = essence;
  const $main = $("main");
  const filterExpression = essence
    .getEffectiveFilter(timekeeper)
    .toExpression(dataCube);
  return $main.filter(filterExpression).limit(LIMIT);
}

export default async function rawDataRoute({ context }: QueryRouterRequest, res: Response) {
  const { dataCube, essence, decorator, timekeeper } = context;
  const query = getQuery(essence, timekeeper);
  const result = await executeQuery(dataCube, query, essence.timezone, decorator);
  res.json({ result });
}
