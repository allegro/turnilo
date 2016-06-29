import { expect } from "chai";
import { immutableArraysEqual } from "immutable-class";
import { Duration } from "chronoshift";
import { Granularity, granularityFromJS, granularityEquals, granularityToString, updateBucketSize, getGranularities, getDefaultGranularityForKind, getBestBucketUnitForRange } from "./granularity";
import { TimeBucketAction, NumberBucketAction, TimeRange, NumberRange } from "plywood";

var { WallTime } = require('chronoshift');
if (!WallTime.rules) {
  var tzData = require("chronoshift/lib/walltime/walltime-data.js");
  WallTime.init(tzData.rules, tzData.zones);
}

describe('Granularity', () => {
  it('fromJSes appropriately', () => {

    var timeBucketAction1 = granularityFromJS({
      action: 'timeBucket',
      duration: 'P1W',
      timezone: 'America/Tijuana'
    });

    expect(timeBucketAction1 instanceof TimeBucketAction).to.equal(true);
    expect((timeBucketAction1 as TimeBucketAction).timezone.toString()).to.equal('America/Tijuana');
    expect((timeBucketAction1 as TimeBucketAction).duration).to.deep.equal(Duration.fromJS('P1W'));

    var timeBucketAction2 = granularityFromJS('PT1H');
    expect(timeBucketAction2 instanceof TimeBucketAction).to.equal(true);
    expect((timeBucketAction2 as TimeBucketAction).timezone).to.equal(undefined);
    expect((timeBucketAction2 as TimeBucketAction).duration).to.deep.equal(Duration.fromJS('PT1H'));

    var numberBucketAction1 = granularityFromJS({
      action: 'numberBucket',
      size: 5,
      offset: 1
    });

    expect(numberBucketAction1 instanceof NumberBucketAction).to.equal(true);
    expect((numberBucketAction1 as NumberBucketAction).size).to.equal(5);
    expect((numberBucketAction1 as NumberBucketAction).offset).to.equal(1);

    var numberBucketAction2 = granularityFromJS(5);

    expect(numberBucketAction2 instanceof NumberBucketAction).to.equal(true);
    expect((numberBucketAction2 as NumberBucketAction).size).to.equal(5);
    expect((numberBucketAction2 as NumberBucketAction).offset).to.equal(0);

  });

  it('to strings appropriately', () => {
    var timeBucketAction1 = granularityFromJS({
      action: 'timeBucket',
      duration: 'P1W',
      timezone: 'America/Tijuana'
    });

    var timeBucketAction2 = granularityFromJS({
      action: 'timeBucket',
      duration: 'P1W',
      timezone: 'America/Tijuana'
    });

    var timeBucketAction3 = granularityFromJS({
      action: 'timeBucket',
      duration: 'P1W',
      timezone: 'Asia/Kathmandu'
    });

    var timeBucketAction4 = granularityFromJS({
      action: 'timeBucket',
      duration: 'P1D',
      timezone: 'Asia/Kathmandu'
    });

    expect(granularityToString(timeBucketAction1)).to.equal('P1W');
    expect(granularityToString(timeBucketAction2)).to.equal('P1W');
    expect(granularityToString(timeBucketAction3)).to.equal('P1W');
    expect(granularityToString(timeBucketAction4)).to.equal('P1D');

    var numberBucketAction1 = granularityFromJS({
      action: 'numberBucket',
      size: 5,
      offset: 1
    });

    var numberBucketAction2 = granularityFromJS({
      action: 'numberBucket',
      size: 5,
      offset: 1
    });

    var numberBucketAction3 = granularityFromJS({
      action: 'numberBucket',
      size: 300000
    });

    var numberBucketAction4 = granularityFromJS(2);

    expect(granularityToString(numberBucketAction1)).to.equal('5');
    expect(granularityToString(numberBucketAction2)).to.equal('5');
    expect(granularityToString(numberBucketAction3)).to.equal('300000');
    expect(granularityToString(numberBucketAction4)).to.equal('2');

  });

  it('equals appropriately', () => {
    var timeBucketAction1 = granularityFromJS({
      action: 'timeBucket',
      duration: 'P1W',
      timezone: 'America/Tijuana'
    });

    var timeBucketAction2 = granularityFromJS({
      action: 'timeBucket',
      duration: 'P1W',
      timezone: 'America/Tijuana'
    });

    var timeBucketAction3 = granularityFromJS({
      action: 'timeBucket',
      duration: 'P1W',
      timezone: 'Asia/Kathmandu'
    });

    var timeBucketAction4 = granularityFromJS({
      action: 'timeBucket',
      duration: 'P1D',
      timezone: 'Asia/Kathmandu'
    });

    expect(granularityEquals(timeBucketAction1, timeBucketAction2)).to.equal(true);
    expect(granularityEquals(timeBucketAction2, timeBucketAction3)).to.equal(false);
    expect(granularityEquals(timeBucketAction3, timeBucketAction4)).to.equal(false);

    var numberBucketAction1 = granularityFromJS({
      action: 'numberBucket',
      size: 5,
      offset: 1
    });

    var numberBucketAction2 = granularityFromJS({
      action: 'numberBucket',
      size: 5,
      offset: 1
    });

    var numberBucketAction3 = granularityFromJS({
      action: 'numberBucket',
      size: 5
    });

    var numberBucketAction4 = granularityFromJS(5);

    expect(granularityEquals(numberBucketAction1, numberBucketAction2)).to.equal(true);
    expect(granularityEquals(numberBucketAction2, numberBucketAction3)).to.equal(false);
    expect(granularityEquals(numberBucketAction3, numberBucketAction4)).to.equal(true);

  });

  it('updatesBucketSize appropriately, preserves original non size properties', () => {

    var numberBucketAction1 = granularityFromJS({
      action: 'numberBucket',
      size: 5,
      offset: 1
    });

    var numberBucketAction2 = granularityFromJS({
      action: 'numberBucket',
      size: 10,
      offset: 0
    });

    var numberBucketAction3 = granularityFromJS({
      action: 'numberBucket',
      size: 10,
      offset: 1
    });

    expect(granularityEquals(updateBucketSize(numberBucketAction1, numberBucketAction2), numberBucketAction3)).to.equal(true);

    var timeBucketAction1 = granularityFromJS({
      action: 'timeBucket',
      duration: 'P1W',
      timezone: 'America/Tijuana'
    });

    var timeBucketAction2 = granularityFromJS({
      action: 'timeBucket',
      duration: 'P1M',
      timezone: null
    });

    var timeBucketAction3 = granularityFromJS({
      action: 'timeBucket',
      duration: 'P1M',
      timezone: 'America/Tijuana'
    });

    expect(granularityEquals(updateBucketSize(timeBucketAction1, timeBucketAction2), timeBucketAction3)).to.equal(true);

  });

  it('getGranularities appropriately for time', () => {
    var defaults = getGranularities('time');
    var expectedDefaults = ['PT1M', 'PT5M', 'PT1H', 'P1D', 'P1W'].map(granularityFromJS);

    expect(immutableArraysEqual(defaults, expectedDefaults), 'time defaults are returned').to.equal(true);

    var coarse = getGranularities('time', null, true);
    var expectedCoarseDefaults = ['PT1M', 'PT5M', 'PT1H', 'PT6H', 'PT12H', 'P1D', 'P1W', 'P1M'].map(granularityFromJS);

    expect(immutableArraysEqual(coarse, expectedCoarseDefaults), 'coarse time defaults are returned').to.equal(true);

    var bucketedBy = getGranularities('time', granularityFromJS('PT12H'), false);
    var expectedDefaults = ['PT12H', 'P1D', 'P1W', 'P1M', 'P3M'].map(granularityFromJS);

    expect(immutableArraysEqual(bucketedBy, expectedDefaults), 'bucketed by returns larger granularities').to.equal(true);

  });

  it('getGranularities appropriately for number', () => {
    var defaults = getGranularities('number');
    var expectedDefaults = [0.1, 1, 10, 100, 1000].map(granularityFromJS);

    expect(immutableArraysEqual(defaults, expectedDefaults), 'number defaults are returned').to.equal(true);

    var bucketedBy = getGranularities('number', granularityFromJS(100), false);
    var expectedGrans = [100, 500, 1000, 5000, 10000].map(granularityFromJS);

    expect(immutableArraysEqual(bucketedBy, expectedGrans), 'bucketed by returns larger granularities').to.equal(true);

  });

  it('getDefaultGranularityForKind appropriately for number', () => {
    var defaultNumber = getDefaultGranularityForKind('number');
    var expected = granularityFromJS(10);

    expect(granularityEquals(defaultNumber, expected)).to.equal(true);

    var bucketedBy = getDefaultGranularityForKind('number', granularityFromJS(50));
    expected = granularityFromJS(50);

    expect(granularityEquals(bucketedBy, expected), 'default will bucket by provided bucketedBy amount').to.equal(true);

    var customGrans = getDefaultGranularityForKind('number', null, [100, 500, 1000, 5000, 10000].map(granularityFromJS));
    expected = granularityFromJS(1000);

    expect(granularityEquals(customGrans, expected), 'default will bucket according to provided customs').to.equal(true);

  });

  it('getDefaultGranularityForKind appropriately for time', () => {
    var defaultNumber = getDefaultGranularityForKind('time');
    var expected = granularityFromJS('P1D');

    expect(granularityEquals(defaultNumber, expected)).to.equal(true);

    var bucketedBy = getDefaultGranularityForKind('time', granularityFromJS('P1W'));
    expected = granularityFromJS('P1W');

    expect(granularityEquals(bucketedBy, expected), 'default will bucket by provided bucketedBy amount').to.equal(true);

    var customGrans = getDefaultGranularityForKind('time', null, ['PT1H', 'PT8H', 'PT12H', 'P1D', 'P1W'].map(granularityFromJS));
    expected = granularityFromJS('PT12H');

    expect(granularityEquals(customGrans, expected), 'default will bucket according to provided customs').to.equal(true);

  });

  it('getsBestBucketUnit appropriately for time defaults depending on coarse flag', () => {
    var month = 'P1M';
    var week = 'P1W';
    var day = 'P1D';
    var twelveHours = 'PT12H';
    var sixHours = 'PT6H';
    var oneHour = 'PT1H';
    var fiveMinutes = 'PT5M';
    var oneMinute = 'PT1M';

    var yearLength = new TimeRange({ start: new Date('1994-02-24T00:00:00.000Z'), end: new Date('1995-02-25T00:00:00.000Z') });
    expect(getBestBucketUnitForRange(yearLength, false).toString()).to.equal(week);
    expect(getBestBucketUnitForRange(yearLength, true).toString()).to.equal(month);

    var monthLength = new TimeRange({ start: new Date('1995-02-24T00:00:00.000Z'), end: new Date('1995-03-25T00:00:00.000Z') });
    expect(getBestBucketUnitForRange(monthLength, false).toString()).to.equal(day);
    expect(getBestBucketUnitForRange(monthLength, true).toString()).to.equal(week);

    var sevenDaysLength = new TimeRange({ start: new Date('1995-02-20T00:00:00.000Z'), end: new Date('1995-02-28T00:00:00.000Z') });
    expect(getBestBucketUnitForRange(sevenDaysLength, false).toString()).to.equal(oneHour);
    expect(getBestBucketUnitForRange(sevenDaysLength, true).toString()).to.equal(day);

    var threeDaysLength = new TimeRange({ start: new Date('1995-02-20T00:00:00.000Z'), end: new Date('1995-02-24T00:00:00.000Z') });
    expect(getBestBucketUnitForRange(sevenDaysLength, false).toString()).to.equal(oneHour);
    expect(getBestBucketUnitForRange(threeDaysLength, true).toString()).to.equal(twelveHours);

    var dayLength = new TimeRange({ start: new Date('1995-02-24T00:00:00.000Z'), end: new Date('1995-02-25T00:00:00.000Z') });
    expect(getBestBucketUnitForRange(dayLength, false).toString()).to.equal(oneHour);
    expect(getBestBucketUnitForRange(dayLength, true).toString()).to.equal(sixHours);

    var fourHours = new TimeRange({ start: new Date('1995-02-24T00:00:00.000Z'), end: new Date('1995-02-24T04:00:00.000Z') });
    expect(getBestBucketUnitForRange(fourHours, false).toString()).to.equal(fiveMinutes);
    expect(getBestBucketUnitForRange(fourHours, true).toString()).to.equal(oneHour);

    var fortyFiveMin = new TimeRange({ start: new Date('1995-02-24T00:00:00.000Z'), end: new Date('1995-02-24T00:45:00.000Z') });
    expect(getBestBucketUnitForRange(fortyFiveMin, false).toString()).to.equal(oneMinute);
    expect(getBestBucketUnitForRange(fortyFiveMin, true).toString()).to.equal(fiveMinutes);

  });

  it('getsBestBucketUnit appropriately for time with bucketing and custom granularities', () => {
    var sixHours = 'PT6H';
    var oneHour = 'PT1H';
    var week = 'P1W';

    var dayLength = new TimeRange({ start: new Date('1995-02-24T00:00:00.000Z'), end: new Date('1995-02-25T00:00:00.000Z') });
    expect(getBestBucketUnitForRange(dayLength, false).toString()).to.equal(oneHour);
    expect(getBestBucketUnitForRange(dayLength, false, granularityFromJS('PT6H')).toString()).to.equal(sixHours);

    var yearLength = new TimeRange({ start: new Date('1994-02-24T00:00:00.000Z'), end: new Date('1995-02-25T00:00:00.000Z') });
    expect(getBestBucketUnitForRange(yearLength, false, granularityFromJS('PT6H')).toString()).to.equal(week);

    var customs = ['PT1H', 'PT8H', 'PT12H', 'P1D', 'P1W'].map(granularityFromJS);
    expect(getBestBucketUnitForRange(dayLength, false, null, customs).toString()).to.equal(oneHour);

    var fortyFiveMin = new TimeRange({ start: new Date('1995-02-24T00:00:00.000Z'), end: new Date('1995-02-24T00:45:00.000Z') });
    expect(getBestBucketUnitForRange(fortyFiveMin, false, null, customs).toString()).to.equal(oneHour);

  });

  it('getsBestBucketUnit appropriately for number defaults with bucketing and custom granularities', () => {
    var ten = new NumberRange({ start: 0, end: 10 });
    var thirtyOne = new NumberRange({ start: 0, end: 31 });
    var hundred = new NumberRange({ start: 0, end: 100 });

    expect(getBestBucketUnitForRange(ten, false)).to.equal(1);
    expect(getBestBucketUnitForRange(thirtyOne, false)).to.equal(1);
    expect(getBestBucketUnitForRange(hundred, false)).to.equal(1);
    expect(getBestBucketUnitForRange(hundred, false, granularityFromJS(50))).to.equal(50);

    var customs = [-5, 0.25, 0.5, 0.78, 5].map(granularityFromJS);
    expect(getBestBucketUnitForRange(ten, false, null, customs)).to.equal(5);

  });

});
