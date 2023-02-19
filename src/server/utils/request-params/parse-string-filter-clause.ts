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

import { Request } from "express";
import { DataCube } from "../../../common/models/data-cube/data-cube";
import { FilterTypes, StringFilterClause } from "../../../common/models/filter-clause/filter-clause";
import { isNil } from "../../../common/utils/general/general";
import { filterDefinitionConverter } from "../../../common/view-definitions/version-4/filter-definition";
import { InvalidRequestError } from "../request-errors/request-errors";

export function parseStringFilterClause(req: Request, dataCube: DataCube): StringFilterClause {
  const clauseJS = req.body.clause;

  if (isNil(clauseJS)) {
    throw new InvalidRequestError("expected clause parameter");
  }

  let clause;
  try {
    clause = filterDefinitionConverter.toFilterClause(clauseJS, dataCube);
  } catch (error) {
    throw new InvalidRequestError(error.message);
  }
  if (clause.type !== FilterTypes.STRING) {
    throw new InvalidRequestError(`expected string filter clause, but got ${clause.type}`);
  }
  // TODO: write clause type-guard and avoid this assertion
  return clause as StringFilterClause;
}
