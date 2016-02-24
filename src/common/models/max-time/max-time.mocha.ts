import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { MaxTime, MaxTimeJS } from './max-time';

describe('MaxTime', () => {
  it('is an immutable class', () => {
    testImmutableClass<MaxTimeJS>(MaxTime, [
      {
        time: new Date("2015-10-15T19:20:00Z"),
        updated: new Date("2015-10-15T19:20:13Z")
      },
      {
        time: new Date("2015-10-15T19:21:00Z"),
        updated: new Date("2015-10-15T19:21:13Z")
      }
    ]);
  });

});

