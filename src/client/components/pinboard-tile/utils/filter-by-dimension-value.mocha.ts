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
import { DimensionFixtures } from "../../../../common/models/dimension/dimension.fixtures";
import filterByDimensionValue from "./filter-by-dimension-value";

describe("filterByDimensionValue", () => {
  it("should pass only datums that contain searched text", () => {
    const searchText = "foobar";
    const dimension = DimensionFixtures.countryURL();
    const { name } = dimension;
    const output = [
      { [name]: "foobar at the start" },
      { [name]: "also at the end: foobar" },
      { [name]: "also foobar in the middle" },
      { [name]: "written with capitals FOOBAR" },
      { [name]: "wirtten with weird casing FooBAr" },
      { [name]: "and inside another word bazfoobarqvux" }
    ];
    const input = [
      { [name]: "without searched word" },
      ...output,
      { [name]: "qvuuuuux" },
      { [name]: "jibberish" }
    ];
    expect(filterByDimensionValue(input, dimension, searchText)).to.be.deep.equal(output);
  });
});
