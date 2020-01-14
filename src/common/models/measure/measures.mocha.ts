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
import { List, OrderedSet } from "immutable";
import { Expression } from "plywood";
import { MeasureJS } from "./measure";
import { MeasureFixtures } from "./measure.fixtures";
import { Measures } from "./measures";
import { MeasuresFixtures } from "./measures.fixtures";

describe("Measures", () => {
  let measures: Measures;

  beforeEach(() => {
    measures = Measures.fromJS(MeasuresFixtures.wikiJS());
  });

  it("should convert symmetrically to / from JS", () => {
    expect(measures.toJS()).to.deep.equal(MeasuresFixtures.wikiJS());
  });

  it("should throw when converting tree with duplicate measure names", () => {
    const measuresWithDuplicateMeasureName = [MeasureFixtures.wikiCountJS(), MeasureFixtures.wikiCountJS()];
    expect(() => Measures.fromJS(measuresWithDuplicateMeasureName)).to.throw("found duplicate measure or group with names: 'count'");
  });

  it("should throw when converting tree with duplicate measure or group names", () => {
    const fakeMeasureWithDuplicateName: MeasureJS = { name: "added_group", formula: "$main.sum($count)" };
    const measuresWithDuplicateMeasureName = [fakeMeasureWithDuplicateName, ...MeasuresFixtures.wikiJS()];
    expect(() => Measures.fromJS(measuresWithDuplicateMeasureName)).to.throw("found duplicate measure or group with names: 'added_group'");
  });

  it("should throw when converting tree with previous measure name", () => {
    const measureWithForbiddenNames = [MeasureFixtures.previousWikiCountJS()];
    expect(() => Measures.fromJS(measureWithForbiddenNames)).to.throw("found measure that starts with forbidden prefixes: '_previous__count' (prefix: '_previous__')");
  });

  it("should throw when converting tree with delta measure name", () => {
    const measureWithForbiddenNames = [MeasureFixtures.deltaWikiCountJS()];
    expect(() => Measures.fromJS(measureWithForbiddenNames)).to.throw("found measure that starts with forbidden prefixes: '_delta__count' (prefix: '_delta__')");
  });

  it("should count measures", () => {
    expect(measures.size()).to.equal(5);
  });

  it("should return the first measure", () => {
    expect(measures.first().toJS()).to.deep.equal(MeasureFixtures.wikiCountJS());
  });

  it("should treat measures with the same structure as equal", () => {
    const otherMeasures = Measures.fromJS(MeasuresFixtures.wikiJS());

    expect(measures).to.be.equivalent(otherMeasures);
  });

  it("should treat measures with different structure as different", () => {
    const [, ...measuresWithoutFirstJS] = MeasuresFixtures.wikiJS();
    const measuresWithoutCount = Measures.fromJS(measuresWithoutFirstJS);

    expect(measures).to.not.be.equivalent(measuresWithoutCount);
  });

  it("should map measures", () => {
    const measureNames = measures.mapMeasures(measure => measure.name);

    expect(measureNames).to.deep.equal(MeasuresFixtures.wikiNames());
  });

  it("should filter measures", () => {
    const countMeasuresJS = measures
      .filterMeasures(measure => measure.name === "count")
      .map(measure => measure.toJS());

    expect(countMeasuresJS).to.deep.equal([MeasureFixtures.wikiCountJS()]);
  });

  it("should traverse measures", () => {
    let measureTitles: string[] = [];
    measures.forEachMeasure(measure => measureTitles.push(measure.title));

    expect(measureTitles).to.deep.equal(MeasuresFixtures.wikiTitles());
  });

  it("should find measure by name", () => {
    const measure = measures.getMeasureByName("count");

    expect(measure.toJS()).to.deep.equal(MeasureFixtures.wikiCountJS());
  });

  it("should find measure by expression", () => {
    const measure = measures.getMeasureByExpression(Expression.fromJSLoose("$main.sum($count)"));

    expect(measure.toJS()).to.deep.equal(MeasureFixtures.wikiCountJS());
  });

  it("should know it contains measure with name", () => {
    expect(measures.containsMeasureWithName("count")).to.be.true;
  });

  it("should provide measure names", () => {
    const measureNames = measures.getMeasureNames();

    expect(measureNames).to.deep.equal(List(MeasuresFixtures.wikiNames()));
  });

  it("should provide first n measure names", () => {
    const measureNames = measures.getFirstNMeasureNames(1);

    expect(measureNames).to.deep.equal(OrderedSet(["count"]));
  });

  it("should be immutable on append", () => {
    const newMeasures = measures.append(MeasureFixtures.wikiUniqueUsers());

    expect(measures.size()).to.equal(5);
    expect(newMeasures).to.not.equal(measures);
    expect(newMeasures).to.not.be.equivalent(measures);
    expect(newMeasures.size()).to.equal(6);
  });

  it("should be immutable on prepend", () => {
    const newMeasures = measures.prepend(MeasureFixtures.wikiUniqueUsers());

    expect(measures.size()).to.equal(5);
    expect(newMeasures).to.not.equal(measures);
    expect(newMeasures).to.not.be.equivalent(measures);
    expect(newMeasures.size()).to.equal(6);
  });
});
