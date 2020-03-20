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
import { Datum } from "plywood";
import { SPLIT } from "../../../config/constants";
import { nestedDataset } from "./nested-dataset";

describe("nestedDataset", () => {
  it("should pick data under SPLIT key", () => {
    expect(nestedDataset({ [SPLIT]: { data: "foobar" } } as any as Datum)).to.equal("foobar");
  });

  it("should handle empty datum", () => {
    expect(nestedDataset(undefined)).to.deep.equal([]);
  });

  it("should handle datum without SPLIT", () => {
    expect(nestedDataset({})).to.deep.equal([]);
  });

  it("should handle datum without nested data", () => {
    expect(nestedDataset({ [SPLIT]: {} } as any as Datum)).to.deep.equal([]);
  });
});
