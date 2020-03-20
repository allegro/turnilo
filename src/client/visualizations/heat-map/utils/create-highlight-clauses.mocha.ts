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

import { expect } from "chai";
import { EssenceFixtures } from "../../../../common/models/essence/essence.fixtures";
import { stringIn } from "../../../../common/models/filter-clause/filter-clause.fixtures";
import createHighlightClauses from "./create-highlight-clauses";
import { dataset } from "./datum-fixtures";

const essence = EssenceFixtures.wikiHeatmap();

describe("createHighlightClauses", () => {
  it("should create clause for second split if clicked on top-gutter", () => {
    const clauses = createHighlightClauses({ x: 50, y: 0, part: "top-gutter" }, essence, dataset);
    expect(clauses).to.be.length(1);

    const [clause] = clauses;
    expect(clause.equals(stringIn("namespace", ["c"]))).to.be.true;
  });

  it("should create clause for first split if clicked on left-gutter", () => {
    const clauses = createHighlightClauses({ x: 0, y: 30, part: "left-gutter" }, essence, dataset);
    expect(clauses).to.be.length(1);

    const [clause] = clauses;
    expect(clause.equals(stringIn("channel", ["de"]))).to.be.true;
  });

  it("should create two clauses if clicked on body", () => {
    const clauses = createHighlightClauses({ x: 50, y: 30, part: "body" }, essence, dataset);
    expect(clauses).to.be.length(2);

    const [first, second] = clauses;
    expect(first.equals(stringIn("channel", ["de"]))).to.be.true;
    expect(second.equals(stringIn("namespace", ["c"]))).to.be.true;
  });
});
