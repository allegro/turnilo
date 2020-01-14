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
import { List } from "immutable";
import { Expression } from "plywood";
import { DimensionJS } from "./dimension";
import { DimensionFixtures } from "./dimension.fixtures";
import { Dimensions } from "./dimensions";
import { DimensionsFixtures } from "./dimensions.fixtures";

describe("Dimensions", () => {
  let dimensions: Dimensions;

  beforeEach(() => {
    dimensions = Dimensions.fromJS(DimensionsFixtures.wikiJS());
  });

  it("should convert symmetrically to / from JS", () => {
    expect(dimensions.toJS()).to.deep.equal(DimensionsFixtures.wikiJS());
  });

  it("should throw when converting tree with duplicate dimension names", () => {
    const dimensionsWithDuplicateDimensionName = [DimensionFixtures.wikiTimeJS(), DimensionFixtures.wikiTimeJS()];
    expect(() => Dimensions.fromJS(dimensionsWithDuplicateDimensionName)).to.throw("found duplicate dimension or group with names: 'time'");
  });

  it("should throw when converting tree with duplicate dimension or group names", () => {
    const fakeDimensionWithDuplicateName: DimensionJS = { name: "comment_group", formula: "$comment_group" };
    const dimensionsWithDuplicateDimensionName = [fakeDimensionWithDuplicateName, ...DimensionsFixtures.wikiJS()];
    expect(() => Dimensions.fromJS(dimensionsWithDuplicateDimensionName)).to.throw("found duplicate dimension or group with names: 'comment_group'");
  });

  it("should count dimensions", () => {
    expect(dimensions.size()).to.equal(12);
  });

  it("should return the first dimension", () => {
    expect(dimensions.first().toJS()).to.deep.equal(DimensionFixtures.wikiTimeJS());
  });

  it("should treat dimensions with the same structure as equal", () => {
    const otherDimensions = Dimensions.fromJS(DimensionsFixtures.wikiJS());

    expect(dimensions).to.be.equivalent(otherDimensions);
  });

  it("should treat dimensions with different structure as different", () => {
    const [, ...dimensionsWithoutFirstJS] = DimensionsFixtures.wikiJS();
    const dimensionsWithoutCount = Dimensions.fromJS(dimensionsWithoutFirstJS);

    expect(dimensions).to.not.be.equivalent(dimensionsWithoutCount);
  });

  it("should map dimensions", () => {
    const dimensionNames = dimensions.mapDimensions(dimension => dimension.name);

    expect(dimensionNames).to.deep.equal(DimensionsFixtures.wikiNames());
  });

  it("should filter dimensions", () => {
    const countDimensionsJS = dimensions
      .filterDimensions(dimension => dimension.name === "time")
      .map(dimension => dimension.toJS());

    expect(countDimensionsJS).to.deep.equal([DimensionFixtures.wikiTimeJS()]);
  });

  it("should traverse dimensions", () => {
    let dimensionTitles: string[] = [];
    dimensions.forEachDimension(dimension => dimensionTitles.push(dimension.title));

    expect(dimensionTitles).to.deep.equal(DimensionsFixtures.wikiTitles());
  });

  it("should find dimension by name", () => {
    const dimension = dimensions.getDimensionByName("time");

    expect(dimension.toJS()).to.deep.equal(DimensionFixtures.wikiTimeJS());
  });

  it("should find dimension by expression", () => {
    const dimension = dimensions.getDimensionByExpression(Expression.fromJSLoose("$time"));

    expect(dimension.toJS()).to.deep.equal(DimensionFixtures.wikiTimeJS());
  });

  it("should know it contains dimension with name", () => {
    expect(dimensions.containsDimensionWithName("time")).to.be.true;
  });

  it("should provide dimension names", () => {
    const dimensionNames = dimensions.getDimensionNames();

    expect(dimensionNames).to.deep.equal(List(DimensionsFixtures.wikiNames()));
  });

  it("should be immutable on append", () => {
    const newDimensions = dimensions.append(DimensionFixtures.number());

    expect(dimensions.size()).to.equal(12);
    expect(newDimensions).to.not.equal(dimensions);
    expect(newDimensions).to.not.be.equivalent(dimensions);
    expect(newDimensions.size()).to.equal(13);
  });

  it("should be immutable on prepend", () => {
    const newDimensions = dimensions.prepend(DimensionFixtures.number());

    expect(dimensions.size()).to.equal(12);
    expect(newDimensions).to.not.equal(dimensions);
    expect(newDimensions).to.not.be.equivalent(dimensions);
    expect(newDimensions.size()).to.equal(13);
  });
});
