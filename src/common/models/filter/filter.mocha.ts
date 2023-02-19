/*
 * Copyright 2015-2016 Imply Data, Inc.
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
import { $ } from "plywood";
import { wikiClientDataCube } from "../data-cube/data-cube.fixtures";
import { StringFilterAction, StringFilterClause } from "../filter-clause/filter-clause";
import { EMPTY_FILTER } from "./filter";

describe("Filter", () => {
  it("works in empty case", () => {
    expect(EMPTY_FILTER.toExpression(wikiClientDataCube).toJS()).to.deep.equal({
      op: "literal",
      value: true
    });
  });

  it("add works", () => {
    let filter = EMPTY_FILTER;
    const reference = "namespace";
    const $namespace = $(reference);

    const clause = new StringFilterClause({ reference, action: StringFilterAction.IN, values: Set.of("en") });
    filter = filter.addClause(clause);

    const en = $namespace.overlap(["en"]);
    expect(filter.toExpression(wikiClientDataCube).toJS(), "lang: en").to.deep.equal(en.toJS());

    filter = filter.setClause(clause.update("values", values => values.add(null)));

    const langNull = $namespace.overlap(["en", null]);
    expect(filter.toExpression(wikiClientDataCube).toJS(), "lang: null").to.deep.equal(langNull.toJS());
  });
});
