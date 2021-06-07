/*
 * Copyright 2017-2021 Allegro.pl
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
import { normalizeDurationName } from "./presets";

describe("normalizeDurationName", () => {
  it("should remove leading 'P' from duration string", () => {
    expect(normalizeDurationName("P24D")).to.be.equal("24D");
  });

  it("should remove 'T' from time duration string", () => {
    expect(normalizeDurationName("PT31M")).to.be.equal("31M");
  });

  it("should remove '1' from duration string for singular interval", () => {
    expect(normalizeDurationName("P1M")).to.be.equal("M");
  });

  it("should remove '1' from duration string for singular time interval", () => {
    expect(normalizeDurationName("PT1M")).to.be.equal("M");
  });

  it("should keep leading '1' in duration string for non-singular interval", () => {
    expect(normalizeDurationName("P10M")).to.be.equal("10M");
  });

  it("should remove leading 'P' from multi period duration string", () => {
    expect(normalizeDurationName("P10M3D")).to.be.equal("10M3D");
  });

  it("should remove T from multi period duration string", () => {
    expect(normalizeDurationName("PT10M3S")).to.be.equal("10M3S");
  });

  it("should keep T from multi period duration string if it is between intervals", () => {
    expect(normalizeDurationName("P10MT3H")).to.be.equal("10MT3H");
  });

  it("should pass malformed duration", () => {
    expect(normalizeDurationName("foobar")).to.be.equal("foobar");
  });
});
