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

import { expect } from "chai";
import { Set } from "immutable";
import { StringFilterAction, StringFilterClause } from "./filter-clause";
import { clausePredicate } from "./filter-clause-predicate";

describe("Clause Predicate", () => {
  describe("StringFilterClause", () => {
    const input = ["foo", "bar", "baz", "qvux", "spam", "eggs"];

    it("Include", () => {
      const clause = new StringFilterClause({ action: StringFilterAction.IN, values: Set.of("bar", "baz") });
      const predicate = clausePredicate(clause);
      expect(input.filter(predicate)).to.be.deep.eq(["bar", "baz"]);
    });
    it("Exclude", () => {
      const clause = new StringFilterClause({ action: StringFilterAction.IN, not: true, values: Set.of("bar", "baz") });
      const predicate = clausePredicate(clause);
      expect(input.filter(predicate)).to.be.deep.eq(["foo", "qvux", "spam", "eggs"]);
    });
    it("Contains", () => {
      const clause = new StringFilterClause({ action: StringFilterAction.CONTAINS, values: Set.of("a") });
      const predicate = clausePredicate(clause);
      expect(input.filter(predicate)).to.be.deep.eq(["bar", "baz", "spam"]);
    });
    it("Regular Expression", () => {
      const clause = new StringFilterClause({ action: StringFilterAction.MATCH, values: Set.of("a(r|z)") });
      const predicate = clausePredicate(clause);
      expect(input.filter(predicate)).to.be.deep.eq(["bar", "baz"]);
    });
  });
});
