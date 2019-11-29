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
import { DataCubeFixtures } from "../../../common/models/data-cube/data-cube.fixtures";
import filterDataCubes from "./data-cubes-filter";

const wiki = DataCubeFixtures.wiki();
const twitter = DataCubeFixtures.twitter();
const custom = DataCubeFixtures.customCube;

describe("DataCubes Filter", () => {

  it("should leave unchanged with empty filter", () => {
    const dataCubes = [twitter, wiki];

    expect(filterDataCubes(dataCubes, ""), "empty string").to.be.deep.equal(dataCubes);
    expect(filterDataCubes(dataCubes, "   "), "blank string").to.be.deep.equal(dataCubes);
  });

  it("should filter based on title", () => {
    const cube = custom("foobar", "description");
    const dataCubes = [cube, wiki, twitter];

    expect(filterDataCubes(dataCubes, "foobar")).to.be.deep.equal([cube]);
  });

  it("should be case insensitive for title", () => {
    const cube = custom("foobar", "description");
    const dataCubes = [cube, wiki, twitter];

    expect(filterDataCubes(dataCubes, "FooBar")).to.be.deep.equal([cube]);
  });

  it("should filter based on description", () => {
    const cube = custom("title", "foobar");
    const dataCubes = [cube, wiki, twitter];

    expect(filterDataCubes(dataCubes, "foobar")).to.be.deep.equal([cube]);
  });

  it("should be case insensitive for description", () => {
    const cube = custom("title", "foobar");
    const dataCubes = [cube, wiki, twitter];

    expect(filterDataCubes(dataCubes, "FooBaR")).to.be.deep.equal([cube]);
  });

  it("should ignore extended description", () => {
    const cube = custom("title", "description", "foobar");
    const dataCubes = [cube, twitter, wiki];

    expect(filterDataCubes(dataCubes, "foobar")).to.be.deep.equal([]);
  });

  it("should not search in content when passed flag", () => {
    const cube = custom("title", "foobar");
    const dataCubes = [cube, twitter, wiki];

    expect(filterDataCubes(dataCubes, "foobar")).to.be.deep.equal([cube]);
    expect(filterDataCubes(dataCubes, "foobar", false)).to.be.deep.equal([]);
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
