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
import { List } from "immutable";
import { EssenceFixtures } from "../../../../common/models/essence/essence.fixtures";
import { FilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { stringIn } from "../../../../common/models/filter-clause/filter-clause.fixtures";
import { Highlight } from "../../base-visualization/highlight";
import { dataset } from "./datum-fixtures";
import getHighlightPosition from "./get-highlight-position";

const essence = EssenceFixtures.wikiHeatmap();

const highlight = (...clauses: FilterClause[]) => new Highlight(List(clauses), null);

describe("getHighlightPosition", () => {
  it("should calculate row and column", () => {
    const clauses = [stringIn("channel", ["fr"]), stringIn("namespace", ["b"])];
    expect(getHighlightPosition(highlight(...clauses), essence, dataset)).to.deep.equal({ row: 2, column: 1 });
  });

  it("should handle only column clause", () => {
    const clauses = [stringIn("namespace", ["d"])];
    expect(getHighlightPosition(highlight(...clauses), essence, dataset)).to.deep.equal({ row: null, column: 3 });
  });

  it("should handle only row clause", () => {
    const clauses = [stringIn("channel", ["pl"])];
    expect(getHighlightPosition(highlight(...clauses), essence, dataset)).to.deep.equal({ row: 3, column: null });
  });
});
