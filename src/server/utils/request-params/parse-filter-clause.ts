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
import { isStringFilterClause, StringFilterClause } from "../../../common/models/filter-clause/filter-clause";
import { isNil } from "../../../common/utils/general/general";
import {
  filterDefinitionConverter,
  StringFilterClauseDefinition
} from "../../../common/view-definitions/version-4/filter-definition";
import { InvalidRequestError } from "../request-errors/request-errors";

function readStringClause(clauseJS: StringFilterClauseDefinition, dataCube: DataCube): StringFilterClause {
  let clause;
  try {
    clause =  filterDefinitionConverter.toFilterClause(clauseJS, dataCube);
  } catch (error) {
    throw new InvalidRequestError(error.message);
  }
  if (!isStringFilterClause(clause)) {
    throw new InvalidRequestError(`Expected string filter clause, but got ${clause.type}`);
  }
  return clause;
}

export function parseStringFilterClause(req: Request, dataCube: DataCube): StringFilterClause {
  const clauseJS = req.body.clause;

  if (isNil(clauseJS)) {
    throw new InvalidRequestError("Parameter clause is required");
  }

  return readStringClause(clauseJS, dataCube);
}

export function parseOptionalStringFilterClause(req: Request, dataCube: DataCube): StringFilterClause | null {
  const clauseJS = req.body.clause;

  if (isNil(clauseJS)) {
    return null;
  }

  return readStringClause(clauseJS, dataCube);
}
