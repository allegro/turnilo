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
import datumByPosition from "./datum-by-position";
import { dataset } from "./datum-fixtures";
import { nestedDataset } from "./nested-dataset";

describe("datumByPosition", () => {
  it("should find row and column datums", () => {
    expect(datumByPosition(dataset, { row: 1, column: 2 })).to.deep.equal([
      dataset[1],
      nestedDataset(dataset[1])[2]
    ]);
  });

  it("should handle incorrect row", () => {
    expect(datumByPosition(dataset, { row: -10, column: 2 })).to.deep.equal([
      null,
      nestedDataset(dataset[0])[2]
    ]);
  });

  it("should handle incorrect column", () => {
    expect(datumByPosition(dataset, { row: 3, column: -10 })).to.deep.equal([
      dataset[3],
      null
    ]);
  });

  it("should handle incorrect row and column", () => {
    expect(datumByPosition(dataset, { row: -10, column: -10 })).to.deep.equal([null, null]);
  });
});
