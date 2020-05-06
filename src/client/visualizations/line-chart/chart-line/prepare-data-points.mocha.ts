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
import { Datum, TimeRange } from "plywood";
import { prepareDataPoints } from "./prepare-data-points";

const getTime = (d: Datum) => d.time as TimeRange;
const getMeasure = (d: Datum) => d.measure as number;

const januaryFirst: Datum = {
  time: new TimeRange({
    start: new Date("2000-01-01"),
    end: new Date("2000-01-02")
  }),
  measure: 234
};

const januarySecond: Datum = {
  time: new TimeRange({
    start: new Date("2000-01-02"),
    end: new Date("2000-01-03")
  }),
  measure: 298
};

const januaryThird: Datum = {
  time: new TimeRange({
    start: new Date("2000-01-03"),
    end: new Date("2000-01-04")
  }),
  measure: 9
};

const januaryFourth: Datum = {
  time: new TimeRange({
    start: new Date("2000-01-04"),
    end: new Date("2000-01-05")
  }),
  measure: 10000
};

const januaryFirstNoon = new Date("2000-01-01T12:00Z");
const januarySecondNoon = new Date("2000-01-02T12:00Z");
const januaryThirdNoon = new Date("2000-01-03T12:00Z");
const januaryFourthNoon = new Date("2000-01-04T12:00Z");

describe("prepareDataPoints", () => {
  it("should pick x and y from singleton", () => {
    const points = prepareDataPoints([januaryFirst], getTime, getMeasure);
    expect(points).to.be.deep.equal([[+januaryFirstNoon, 234]]);
  });

  it("should pick x's and y's", () => {
    const points = prepareDataPoints([januaryFirst, januarySecond, januaryThird], getTime, getMeasure);
    expect(points).to.be.deep.equal([
      [+januaryFirstNoon, 234],
      [+januarySecondNoon, 298],
      [+januaryThirdNoon, 9]
    ]);
  });

  it("should insert missing point (twice - because it inserts from both sides)", () => {
    const points = prepareDataPoints([januaryFirst, januaryThird], getTime, getMeasure);
    expect(points).to.be.deep.equal([
      [+januaryFirstNoon, 234],
      [+januarySecondNoon, 0],
      [+januarySecondNoon, 0],
      [+januaryThirdNoon, 9]
    ]);
  });

  it("should insert missing points", () => {
    const points = prepareDataPoints([januaryFirst, januaryFourth], getTime, getMeasure);
    expect(points).to.be.deep.equal([
      [+januaryFirstNoon, 234],
      [+januarySecondNoon, 0],
      [+januaryThirdNoon, 0],
      [+januaryFourthNoon, 10000]
    ]);
  });

  it("should not insert missing point after last one", () => {
    const points = prepareDataPoints([januaryThird, januaryFourth], getTime, getMeasure);
    expect(points).to.be.deep.equal([
      [+januaryThirdNoon, 9],
      [+januaryFourthNoon, 10000]
    ]);
  });

  it("should not insert missing point before first one", () => {
    const points = prepareDataPoints([januaryFirst, januarySecond], getTime, getMeasure);
    expect(points).to.be.deep.equal([
      [+januaryFirstNoon, 234],
      [+januarySecondNoon, 298]
    ]);
  });
});
