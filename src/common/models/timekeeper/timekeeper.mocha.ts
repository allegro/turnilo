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
import { testImmutableClass } from "immutable-class-tester";

import { Timekeeper } from "./timekeeper";

describe("Timekeeper", () => {
  it("is an immutable class", () => {
    testImmutableClass(Timekeeper, [
      {
        timeTags: {},
        nowOverride: null
      },
      {
        timeTags: {
          lol: {
            name: "lol",
            time: new Date("2016-01-01T01:02:03Z"),
            lastTimeChecked: new Date("2016-01-01T01:02:03Z"),
            checkInterval: 42000
          }
        },
        nowOverride: null
      },
      {
        timeTags: {
          lol: {
            name: "lol",
            time: new Date("2016-01-01T01:02:03Z"),
            lastTimeChecked: new Date("2016-01-01T01:02:03Z"),
            checkInterval: 42000
          }
        },
        nowOverride: new Date("2016-01-01T01:02:03Z")
      }
    ]);
  });

  it("works with now", () => {
    const timekeeper = Timekeeper.fromJS({
      timeTags: {},
      nowOverride: new Date("2016-01-01T01:02:03Z")
    });

    expect(timekeeper.now()).to.deep.equal(new Date("2016-01-01T01:02:03Z"));
  });
});
