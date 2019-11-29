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

import { complement, Predicate } from "../../utils/functional/functional";
import { StringFilterAction, StringFilterClause } from "./filter-clause";

export function clausePredicate({ action, values, not }: StringFilterClause): Predicate<string> {
  switch (action) {
    case StringFilterAction.IN:
      const predicate = (str: string) => values.has(str);
      return not ? complement(predicate) : predicate;
    case StringFilterAction.MATCH:
      const regExp = new RegExp(values.first());
      return str => regExp.test(str);
    case StringFilterAction.CONTAINS:
      return str => str.includes(values.first());
  }
}
