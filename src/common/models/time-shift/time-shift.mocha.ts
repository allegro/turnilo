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
import { testImmutableClass } from "immutable-class-tester";
import { TimeShift, isValidTimeShift } from "./time-shift";

describe("TimeShift", () => {
  it("is an immutable class", () => {
    testImmutableClass(TimeShift, [null, "P1D"]);
  });
});

describe("isValidTimeShift", () => {
  it("should return false for invalid timeshifts", () => {

    expect(isValidTimeShift(""), "empty string").to.be.false;
    expect(isValidTimeShift("1234"), "number").to.be.false;
    expect(isValidTimeShift("1D"), "duration without leading P").to.be.false;
    expect(isValidTimeShift("P1H"), "hour duration without T").to.be.false;
  });

  it("should return true for valid timeshifts", () => {
    expect(isValidTimeShift(null), "<null>").to.be.true;
    expect(isValidTimeShift("PT1H"), "one hour").to.be.true;
    expect(isValidTimeShift("P2D"), "two days").to.be.true;
    expect(isValidTimeShift("P3W"), "three weeks").to.be.true;
    expect(isValidTimeShift("P2M"), "two months").to.be.true;
    expect(isValidTimeShift("P5Y"), "five years").to.be.true;
  });
});
