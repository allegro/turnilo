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
import { DataCubeFixtures } from "../../../common/models/data-cube/data-cube.fixtures";
import filterDataCubes from "./data-cubes-filter";

const wiki = DataCubeFixtures.wiki();
const twitter = DataCubeFixtures.twitter();
const custom = DataCubeFixtures.customCube;

describe("DataCubes Filter", () => {

  it("should leave unchanged with empty filter", () => {
    const dataCubes = [twitter, wiki];

    expect(filterDataCubes(dataCubes, ""), "empty string").to.be.deep.equal(dataCubes);
    expect(filterDataCubes(dataCubes, null), "<null>").to.be.deep.equal(dataCubes);
    expect(filterDataCubes(dataCubes, "   "), "blank string").to.be.deep.equal(dataCubes);
  });

  it("should filter based on title", () => {
    const dataCubes = [twitter, wiki];

    expect(filterDataCubes(dataCubes, "wiki")).to.be.deep.equal([wiki]);
  });

  it("should be case insensitive for title", () => {
    const dataCubes = [twitter, wiki];

    expect(filterDataCubes(dataCubes, "WiKi")).to.be.deep.equal([wiki]);
  });

  it("should filter based on description", () => {
    const dataCubes = [twitter, wiki];

    expect(filterDataCubes(dataCubes, "should")).to.be.deep.equal([twitter]);
  });

  it("should be case insensitive for description", () => {
    const dataCubes = [twitter, wiki];

    expect(filterDataCubes(dataCubes, "sHoUlD")).to.be.deep.equal([twitter]);
  });

  it("should sort with rank", () => {
    const withTitle = custom("foobar", "lorem ipsum lorem ipsum");
    const withTitleShifted = custom("lorem foobar", "lorem ipsum lorem ipsum");
    const withDescription = custom("bazz", "foobar lorem ipsum lorem ipsum");
    const withDoubleDescription = custom("bazz", "foobar lorem ipsum foobar lorem ipsum");

    expect(filterDataCubes([withDescription, wiki, twitter, withTitle], "foobar"), "title then description").to.be.deep.equal([withTitle, withDescription]);
    expect(filterDataCubes([twitter, withTitleShifted, withTitle, wiki], "foobar"), "earlier title first").to.be.deep.equal([withTitle, withTitleShifted]);
    expect(filterDataCubes([withDescription, twitter, wiki, withDoubleDescription], "foobar"), "counts occurrences in description").to.be.deep.equal([withDoubleDescription, withDescription]);

    expect(filterDataCubes([withDescription, twitter, withTitleShifted, twitter, withTitle, wiki, withDoubleDescription], "foobar"), "all")
      .to.be.deep.equal([withTitle, withTitleShifted, withDoubleDescription, withDescription]);
  });
});
