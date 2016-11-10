import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class-tester';

import { Timekeeper } from './timekeeper';

describe('Timekeeper', () => {
  it('is an immutable class', () => {
    testImmutableClass(Timekeeper, [
      {
        timeTags: []
      },
      {
        timeTags: [
          { name: 'lol', time: new Date('2016-01-01T01:02:03Z'), updated: new Date('2016-01-01T01:02:03Z') }
        ]
      },
      {
        timeTags: [
          { name: 'lol', time: new Date('2016-01-01T01:02:03Z'), updated: new Date('2016-01-01T01:02:03Z') }
        ],
        nowOverride: new Date('2016-01-01T01:02:03Z')
      }
    ]);
  });

  it('works with now', () => {
    var timekeeper = Timekeeper.fromJS({
      timeTags: [],
      nowOverride: new Date('2016-01-01T01:02:03Z')
    });

    expect(timekeeper.now()).to.deep.equal(new Date('2016-01-01T01:02:03Z'));
  });

});
