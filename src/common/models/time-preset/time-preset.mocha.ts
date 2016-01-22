'use strict';

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { TimePreset } from './time-preset';

describe('TimePreset', () => {

  it('is an immutable class', () => {

    testImmutableClass(TimePreset, [
      {
        name: 'range1',
        timeRange: {
          start: new Date('2013-02-26T19:00:00.000Z'),
          end: new Date('2013-02-27T19:00:00.000Z')
        }
      },
      {
        name: 'range2',
        timeRange: {
          start: new Date('2013-02-26T19:00:00.000Z'),
          end: new Date('2013-02-27T19:00:00.000Z')
        }
      }
    ]);
  });
});
