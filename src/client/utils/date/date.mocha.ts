import { expect } from "chai";
import '../../utils/test-utils/index';
import { Timezone } from "chronoshift";
import { datesEqual, prependDays, appendDays, getEndWallTimeInclusive, getWallTimeDay, getWallTimeMonthWithYear } from "./date";

var { WallTime } = require('chronoshift');
if (!WallTime.rules) {
  var tzData = require("chronoshift/lib/walltime/walltime-data.js");
  WallTime.init(tzData.rules, tzData.zones);
}

describe('Date', () => {
  it('calculates date equality properly', () => {
    expect(datesEqual(null, new Date()), 'null and not null').to.equal(false);
    expect(datesEqual(null, null), 'null and null').to.equal(true);
    expect(datesEqual(new Date('1995-02-24T00:00:00.000Z'), new Date('1995-02-24T00:00:00.000Z')), 'equal dates').to.equal(true);
    expect(datesEqual(new Date('1995-02-24T00:00:00.000Z'), new Date('1995-02-24T00:02:00.000Z')), 'not equal dates').to.equal(false);
  });

  it('prepends days', () => {
    var testFirstWeek: Date[] = [];
    for (var i = 1; i < 5; i++) {
      testFirstWeek.push(new Date(Date.UTC(1995, 2, i)));
    }

    var prepended = prependDays(Timezone.UTC, testFirstWeek, 5);
    expect(prepended).to.deep.equal([
      new Date('1995-02-24T00:00:00.000Z'),
      new Date('1995-02-25T00:00:00.000Z'),
      new Date('1995-02-26T00:00:00.000Z'),
      new Date('1995-02-27T00:00:00.000Z'),
      new Date('1995-02-28T00:00:00.000Z'),
      new Date('1995-03-01T00:00:00.000Z'),
      new Date('1995-03-02T00:00:00.000Z'),
      new Date('1995-03-03T00:00:00.000Z'),
      new Date('1995-03-04T00:00:00.000Z')
    ]);
  });

  it('appends days', () => {
    var testWeek: Date[] = [];
    for (var i = 1; i < 5; i++) {
      testWeek.push(new Date(Date.UTC(1995, 2, i)));
    }

    var append = appendDays(Timezone.UTC, testWeek, 5);
    expect(append).to.deep.equal([
      new Date('1995-03-01T00:00:00.000Z'),
      new Date('1995-03-02T00:00:00.000Z'),
      new Date('1995-03-03T00:00:00.000Z'),
      new Date('1995-03-04T00:00:00.000Z'),
      new Date('1995-03-05T00:00:00.000Z'),
      new Date('1995-03-06T00:00:00.000Z'),
      new Date('1995-03-07T00:00:00.000Z'),
      new Date('1995-03-08T00:00:00.000Z'),
      new Date('1995-03-09T00:00:00.000Z')
    ]);
  });

  const TZ_KATHMANDU = new Timezone("Asia/Kathmandu"); // +5.8;
  const TZ_TIJUANA = new Timezone("America/Tijuana"); // -8.0
  const TZ_Kiritimati = new Timezone("Pacific/Kiritimati");  // +14.0

  it('gets human friendly end time which is -1 ms from actual end time', () => {
    var endExclusive = new Date("1995-03-09T00:00:00.000Z");
    var timezone = new Timezone("America/Tijuana");
    var endWallTimeInclusive = (getEndWallTimeInclusive(endExclusive, timezone) as any)['wallTime'].toISOString();
    expect(endWallTimeInclusive, 'tijuana').to.equal(new Date("1995-03-08T15:59:59.999Z").toISOString());
    endExclusive = new Date("1995-03-09T00:00:00.000Z");
    endWallTimeInclusive = (getEndWallTimeInclusive(endExclusive, TZ_KATHMANDU) as any)['wallTime'].toISOString();
    expect(endWallTimeInclusive, 'kathmandu').to.equal(new Date("1995-03-09T05:44:59.999Z").toISOString());
    endExclusive = new Date("1999-03-09T00:00:00.000Z");
    endWallTimeInclusive = (getEndWallTimeInclusive(endExclusive, TZ_TIJUANA) as any)['wallTime'].toISOString();
    expect(endWallTimeInclusive, 'tijuana2').to.equal(new Date("1999-03-08T15:59:59.999Z").toISOString());
    endExclusive = new Date("2016-02-28T00:00:00.000Z");
    endWallTimeInclusive = (getEndWallTimeInclusive(endExclusive, TZ_Kiritimati) as any)['wallTime'].toISOString();
    expect(endWallTimeInclusive, 'kiritimati').to.equal(new Date("2016-02-28T13:59:59.999Z").toISOString());
  });

  it('get walltime day returns day according to walltime', () => {
    var date = new Date("1995-03-09T00:00:00.000Z");
    expect(getWallTimeDay(date, TZ_TIJUANA), 'tijuana walltime').to.equal(8);
    expect(getWallTimeDay(date, TZ_KATHMANDU), 'kathmandu walltime').to.equal(9);
    expect(getWallTimeDay(date, TZ_Kiritimati), 'kiritimati walltime').to.equal(9);
  });

  it('get walltime month returns full month and year according to walltime', () => {
    var date = new Date("1965-02-02T13:00:00.000Z");
    expect(getWallTimeMonthWithYear(date, TZ_TIJUANA), 'basic tijuana').to.equal("February 1965");
    expect(getWallTimeMonthWithYear(date, TZ_KATHMANDU), 'basic kathmandu').to.equal("February 1965");
    expect(getWallTimeMonthWithYear(date, TZ_Kiritimati), 'basic kiritimati').to.equal("February 1965");
    date = new Date("1999-12-31T20:15:00.000Z");
    expect(getWallTimeMonthWithYear(date, TZ_TIJUANA), 'y2k tijuana').to.equal("December 1999");
    expect(getWallTimeMonthWithYear(date, TZ_KATHMANDU), 'y2k kathmandu').to.equal("January 2000");
    expect(getWallTimeMonthWithYear(date, TZ_Kiritimati), 'y2k kiritimati').to.equal("January 2000");
  });
});


