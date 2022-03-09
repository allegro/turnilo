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

import { expect, use } from "chai";
import chaiDatetime from "chai-datetime";
import { Timezone } from "chronoshift";
import { NumberRange } from "plywood";
import equivalent from "../../../utils/test-utils/equivalent";
import { constructRange, shiftByOne } from "./continuous-range";

use(equivalent);
use(chaiDatetime);

const tz = Timezone.UTC;

describe("continuousRange", () => {
  describe("shiftByOne", () => {
    it("should add 1 to number", () => {
      expect(shiftByOne(100, tz)).to.be.equal(101);
    });

    it("should add 1 second to date", () => {
      expect(shiftByOne(new Date("2000-01-01T12:00:00"), tz)).to.be.equalDate(new Date("2000-01-01T12:00:01"));
    });
  });

  describe("constructRange", () => {
    it("should construct range object", () => {
      expect(constructRange(100, 200, tz)).to.be.equivalent(new NumberRange({ start: 100, end: 200 }));
    });

    it("should switch start and end to correct order", () => {
      expect(constructRange(200, 100, tz)).to.be.equivalent(new NumberRange({ start: 100, end: 200 }));
    });

    it("should create minimal range when start is equal to end", () => {
      expect(constructRange(100, 100, tz)).to.be.equivalent(new NumberRange({ start: 100, end: 101 }));
    });
  });
});
