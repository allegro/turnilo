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

import { IncomingHttpHeaders } from "http";
import { Expression, RefExpression } from "plywood";
import { DynamicSubsetFormula } from "../../../common/models/dynamic-subset-formula/dynamic-subset-formula";
import { isNil } from "../../../common/utils/general/general";

function filterMain(expression: Expression, filter: Expression): Expression {
  return expression.substitute(e => {
    if (e instanceof RefExpression && e.name === "main") {
      return e.filter(filter);
    }
    return null;
  });
}

export function applySubset(expression: Expression, dynamicSubsetFormula: DynamicSubsetFormula, headers: IncomingHttpHeaders): Expression {
  if (isNil(dynamicSubsetFormula)) return expression;
  try {
    const subsetFilter = dynamicSubsetFormula.getSubsetExpression(headers);
    if (!(subsetFilter instanceof Expression)) {
      console.log("DynamicSubsetFormula should return Expression, instead returned:", subsetFilter);
      return expression;
    }
    return filterMain(expression, subsetFilter);
  } catch (e) {
    console.log("DynamicSubsetFormula function threw error:", e.message);
    return expression;
  }
}
