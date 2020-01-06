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
import { Duration } from "chronoshift";
import { NumberRange, TimeRange } from "plywood";
import { getBestBucketUnitForRange, getDefaultGranularityForKind, getGranularities, granularityEquals, granularityFromJS, granularityToString } from "./granularity";

describe("Granularity", () => {
  it("fromJSes appropriately", () => {

    const timeBucketAction1 = granularityFromJS("P1W");

    expect(timeBucketAction1 instanceof Duration).to.be.true;
    expect(timeBucketAction1).to.deep.equal(Duration.fromJS("P1W"));

    const timeBucketAction2 = granularityFromJS("PT1H");
    expect(timeBucketAction2 instanceof Duration).to.be.true;
    expect(timeBucketAction2).to.deep.equal(Duration.fromJS("PT1H"));

    const numberBucketAction1 = granularityFromJS(5);

    expect(typeof numberBucketAction1 === "number").to.be.true;
    expect(numberBucketAction1).to.equal(5);
  });

  it("to strings appropriately", () => {
    const timeBucketAction1 = granularityFromJS("P1W");

    expect(granularityToString(timeBucketAction1)).to.equal("P1W");

    const numberBucketAction1 = granularityFromJS(5);
    const numberBucketAction3 = granularityFromJS(300000);
    const numberBucketAction4 = granularityFromJS(2);

    expect(granularityToString(numberBucketAction1)).to.equal("5");
    expect(granularityToString(numberBucketAction3)).to.equal("300000");
    expect(granularityToString(numberBucketAction4)).to.equal("2");

  });

  it("equals appropriately", () => {
    const timeBucketAction1 = granularityFromJS("P1W");

    const timeBucketAction2 = granularityFromJS("P1W");

    const timeBucketAction3 = granularityFromJS("P1D");

    expect(granularityEquals(timeBucketAction1, timeBucketAction2)).to.be.true;
    expect(granularityEquals(timeBucketAction2, timeBucketAction3)).to.be.false;

    const numberBucketAction1 = granularityFromJS(5);

    const numberBucketAction2 = granularityFromJS(5);

    const numberBucketAction3 = granularityFromJS(3);

    expect(granularityEquals(numberBucketAction1, numberBucketAction2)).to.be.true;
    expect(granularityEquals(numberBucketAction2, numberBucketAction3)).to.be.false;
  });

  it("getGranularities appropriately for time", () => {
    const defaults = getGranularities("time");
    let expectedDefaults = ["PT1M", "PT5M", "PT1H", "P1D", "P1W"].map(granularityFromJS);

    expect(defaults.every((g, i) => granularityEquals(g, expectedDefaults[i]), "time defaults are returned")).to.be.true;

    const coarse = getGranularities("time", null, true);
    const expectedCoarseDefaults = ["PT1M", "PT5M", "PT1H", "PT6H", "PT12H", "P1D", "P1W", "P1M"].map(granularityFromJS);

    expect(coarse.every((g, i) => granularityEquals(g, expectedCoarseDefaults[i]), "coarse time defaults are returned")).to.be.true;

    const bucketedBy = getGranularities("time", granularityFromJS("PT12H"), false);
    expectedDefaults = ["PT12H", "P1D", "P1W", "P1M", "P3M"].map(granularityFromJS);

    expect(bucketedBy.every((g, i) => granularityEquals(g, expectedDefaults[i]), "bucketed by time defaults are returned")).to.be.true;
  });

  it("getGranularities appropriately for number", () => {
    const defaults = getGranularities("number");
    const expectedDefaults = [0.1, 1, 10, 100, 1000].map(granularityFromJS);

    expect(defaults.every((g, i) => granularityEquals(g, expectedDefaults[i]), "number defaults are returned")).to.be.true;

    const bucketedBy = getGranularities("number", granularityFromJS(100), false);
    const expectedGrans = [100, 500, 1000, 5000, 10000].map(granularityFromJS);

    expect(bucketedBy.every((g, i) => granularityEquals(g, expectedGrans[i]), "bucketed by returns larger granularities")).to.be.true;

  });

  it("getDefaultGranularityForKind appropriately for number", () => {
    const defaultNumber = getDefaultGranularityForKind("number");
    let expected = granularityFromJS(10);

    expect(granularityEquals(defaultNumber, expected)).to.equal(true);

    const bucketedBy = getDefaultGranularityForKind("number", granularityFromJS(50));
    expected = granularityFromJS(50);

    expect(granularityEquals(bucketedBy, expected), "default will bucket by provided bucketedBy amount").to.equal(true);

    const customGrans = getDefaultGranularityForKind("number", null, [100, 500, 1000, 5000, 10000].map(granularityFromJS));
    expected = granularityFromJS(1000);

    expect(granularityEquals(customGrans, expected), "default will bucket according to provided customs").to.equal(true);

  });

  it("getDefaultGranularityForKind appropriately for time", () => {
    const defaultNumber = getDefaultGranularityForKind("time");
    let expected = granularityFromJS("P1D");

    expect(granularityEquals(defaultNumber, expected)).to.equal(true);

    const bucketedBy = getDefaultGranularityForKind("time", granularityFromJS("P1W"));
    expected = granularityFromJS("P1W");

    expect(granularityEquals(bucketedBy, expected), "default will bucket by provided bucketedBy amount").to.equal(true);

    const customGrans = getDefaultGranularityForKind("time", null, ["PT1H", "PT8H", "PT12H", "P1D", "P1W"].map(granularityFromJS));
    expected = granularityFromJS("PT12H");

    expect(granularityEquals(customGrans, expected), "default will bucket according to provided customs").to.equal(true);

  });

  it("getsBestBucketUnit appropriately for time defaults depending on coarse flag", () => {
    const month = "P1M";
    const week = "P1W";
    const day = "P1D";
    const twelveHours = "PT12H";
    const sixHours = "PT6H";
    const oneHour = "PT1H";
    const fiveMinutes = "PT5M";
    const oneMinute = "PT1M";

    const yearLength = new TimeRange({ start: new Date("1994-02-24T00:00:00.000Z"), end: new Date("1995-02-25T00:00:00.000Z") });
    expect(getBestBucketUnitForRange(yearLength, false).toString()).to.equal(week);
    expect(getBestBucketUnitForRange(yearLength, true).toString()).to.equal(month);

    const monthLength = new TimeRange({ start: new Date("1995-02-24T00:00:00.000Z"), end: new Date("1995-03-25T00:00:00.000Z") });
    expect(getBestBucketUnitForRange(monthLength, false).toString()).to.equal(day);
    expect(getBestBucketUnitForRange(monthLength, true).toString()).to.equal(week);

    const sevenDaysLength = new TimeRange({ start: new Date("1995-02-20T00:00:00.000Z"), end: new Date("1995-02-28T00:00:00.000Z") });
    expect(getBestBucketUnitForRange(sevenDaysLength, false).toString()).to.equal(oneHour);
    expect(getBestBucketUnitForRange(sevenDaysLength, true).toString()).to.equal(day);

    const threeDaysLength = new TimeRange({ start: new Date("1995-02-20T00:00:00.000Z"), end: new Date("1995-02-24T00:00:00.000Z") });
    expect(getBestBucketUnitForRange(sevenDaysLength, false).toString()).to.equal(oneHour);
    expect(getBestBucketUnitForRange(threeDaysLength, true).toString()).to.equal(twelveHours);

    const dayLength = new TimeRange({ start: new Date("1995-02-24T00:00:00.000Z"), end: new Date("1995-02-25T00:00:00.000Z") });
    expect(getBestBucketUnitForRange(dayLength, false).toString()).to.equal(oneHour);
    expect(getBestBucketUnitForRange(dayLength, true).toString()).to.equal(sixHours);

    const fourHours = new TimeRange({ start: new Date("1995-02-24T00:00:00.000Z"), end: new Date("1995-02-24T04:00:00.000Z") });
    expect(getBestBucketUnitForRange(fourHours, false).toString()).to.equal(fiveMinutes);
    expect(getBestBucketUnitForRange(fourHours, true).toString()).to.equal(oneHour);

    const fortyFiveMin = new TimeRange({ start: new Date("1995-02-24T00:00:00.000Z"), end: new Date("1995-02-24T00:45:00.000Z") });
    expect(getBestBucketUnitForRange(fortyFiveMin, false).toString()).to.equal(oneMinute);
    expect(getBestBucketUnitForRange(fortyFiveMin, true).toString()).to.equal(fiveMinutes);

  });

  it("getsBestBucketUnit appropriately for time with bucketing and custom granularities", () => {
    const sixHours = "PT6H";
    const oneHour = "PT1H";
    const week = "P1W";

    const dayLength = new TimeRange({ start: new Date("1995-02-24T00:00:00.000Z"), end: new Date("1995-02-25T00:00:00.000Z") });
    expect(getBestBucketUnitForRange(dayLength, false).toString()).to.equal(oneHour);
    expect(getBestBucketUnitForRange(dayLength, false, granularityFromJS("PT6H")).toString()).to.equal(sixHours);

    const yearLength = new TimeRange({ start: new Date("1994-02-24T00:00:00.000Z"), end: new Date("1995-02-25T00:00:00.000Z") });
    expect(getBestBucketUnitForRange(yearLength, false, granularityFromJS("PT6H")).toString()).to.equal(week);

    const customs = ["PT1H", "PT8H", "PT12H", "P1D", "P1W"].map(granularityFromJS);
    expect(getBestBucketUnitForRange(dayLength, false, null, customs).toString()).to.equal(oneHour);

    const fortyFiveMin = new TimeRange({ start: new Date("1995-02-24T00:00:00.000Z"), end: new Date("1995-02-24T00:45:00.000Z") });
    expect(getBestBucketUnitForRange(fortyFiveMin, false, null, customs).toString()).to.equal(oneHour);

  });

  it("getsBestBucketUnit appropriately for number defaults with bucketing and custom granularities", () => {
    const ten = new NumberRange({ start: 0, end: 10 });
    const thirtyOne = new NumberRange({ start: 0, end: 31 });
    const hundred = new NumberRange({ start: 0, end: 100 });

    expect(getBestBucketUnitForRange(ten, false)).to.equal(1);
    expect(getBestBucketUnitForRange(thirtyOne, false)).to.equal(1);
    expect(getBestBucketUnitForRange(hundred, false)).to.equal(1);
    expect(getBestBucketUnitForRange(hundred, false, granularityFromJS(50))).to.equal(50);

    const customs = [-5, 0.25, 0.5, 0.78, 5].map(granularityFromJS);
    expect(getBestBucketUnitForRange(ten, false, null, customs)).to.equal(5);

  });

});
