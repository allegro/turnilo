/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { testImmutableClass } from "immutable-class-tester";

import { SplitCombine, SplitCombineJS } from "./split-combine";

describe("SplitCombine", () => {
  it("is an immutable class", () => {
    testImmutableClass<SplitCombineJS>(SplitCombine, [
      {
        expression: { op: "ref", name: "language" }
      },
      {
        expression: { op: "ref", name: "lookup" }
      },
      {
        expression: { op: "ref", name: "time" },
        bucketAction: {
          op: "in",
          expression: {
            op: "literal",
            value: { setType: "STRING", elements: ["he"] },
            type: "SET"
          }
        },
        sortAction: {
          op: "sort",
          direction: "ascending",
          expression: {
            op: "ref",
            name: "time"
          }
        },
        limitAction: {
          op: "limit",
          value: 2
        }
      }
    ]);
  });
});
