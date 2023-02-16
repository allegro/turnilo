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
import { Expression } from "plywood";
import { MeasureFixtures } from "./measure.fixtures";
import {
  append,
  findMeasureByExpression,
  findMeasureByName,
  fromConfig,
  hasMeasureWithName,
  prepend
} from "./measures";
import { MeasuresFixtures } from "./measures.fixtures";

describe("Measures", () => {
  it("should throw when converting tree with previous measure name", () => {
    const measureWithForbiddenNames = [MeasureFixtures.previousWikiCountJS()];
    expect(() => fromConfig(measureWithForbiddenNames))
      .to.throw("measure _previous__count starts with forbidden prefix: _previous__");
  });

  it("should throw when converting tree with delta measure name", () => {
    const measureWithForbiddenNames = [MeasureFixtures.deltaWikiCountJS()];
    expect(() => fromConfig(measureWithForbiddenNames))
      .to.throw("measure _delta__count starts with forbidden prefix: _delta__");
  });

  it("should find measure by name", () => {
    const measure = findMeasureByName(MeasuresFixtures.wiki(), "count");

    expect(measure).to.deep.equal(MeasureFixtures.count());
  });

  it("should find measure by expression", () => {
    const measure = findMeasureByExpression(MeasuresFixtures.wiki(), Expression.fromJSLoose("$main.count()"));

    expect(measure).to.deep.equal(MeasureFixtures.count());
  });

  it("should know it contains measure with name", () => {
    expect(hasMeasureWithName(MeasuresFixtures.wiki(), "count")).to.be.true;
  });

  it("should append new measure at the end", () => {
    const newMeasures = append(MeasuresFixtures.wiki(), MeasureFixtures.wikiUniqueUsers());
    const lastMeasure = newMeasures.byName[newMeasures.tree[newMeasures.tree.length - 1] as string];

    expect(lastMeasure).to.be.deep.equal(MeasureFixtures.wikiUniqueUsers());
  });

  it("should prepend new measure at the start", () => {
    const newMeasures = prepend(MeasuresFixtures.wiki(), MeasureFixtures.wikiUniqueUsers());
    const firstMeasure = newMeasures.byName[newMeasures.tree[0] as string];

    expect(firstMeasure).to.be.deep.equal(MeasureFixtures.wikiUniqueUsers());
  });
});
