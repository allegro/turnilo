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

import { Predicates } from "./predicates";

describe("dimension kind matcher", () => {
  const strictCompare = Predicates.strictCompare;

  it("should work in various cases", () => {
    const cases: any[] = [
      [[], [], true],
      [["time"], ["time"], true],
      [["time", "*"], ["pouet", "time"], false],
      [["time", "*"], ["time", "tut"], true],
      [["!time"], ["pouet"], true],
      [["!time"], ["time"], false],
      [["*"], ["time"], true]
    ];

    cases.forEach((c, i) => {
      expect(strictCompare(c[0], c[1])).to.equal(c[2], `test case #${i}`);
    });
  });
});
