import { expect } from "chai";
import { Duration } from "chronoshift";
import { Granularity, granularityFromJS, granularityEquals, granularityToString } from "./granularity";
import { TimeBucketAction, NumberBucketAction } from "plywood";

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

});
