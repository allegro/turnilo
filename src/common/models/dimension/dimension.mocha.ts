/*
 * Copyright 2015-2016 Imply Data, Inc.
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
import { Dimension, DimensionKind, fromConfig } from "./dimension";

describe("Dimension", () => {
  describe("errors", () => {
    it("throws on invalid type", () => {
      var dimJS = {
        name: "mixed_granularities",
        title: "Mixed Granularities",
        kind: "string" as DimensionKind,
        granularities: [5, 50, "P1W", 800, 1000]
      };

      expect(() => {
        fromConfig(dimJS);
      }).to.throw("granularities must have the same type of actions");

      var dimJS2 = {
        name: "bad type",
        title: "Bad Type",
        kind: "string",
        granularities: [false, true, true, false, false]
      };

      expect(() => {
        fromConfig(dimJS2 as any);
      }).to.throw("input should be number or Duration");

    });

  });

})
;
