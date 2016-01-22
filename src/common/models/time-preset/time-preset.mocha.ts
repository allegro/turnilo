'use strict';

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { TimePreset } from './time-preset';

describe('TimePreset', () => {
  testImmutableClass(TimePreset,
    [{
      name: 'preset1',
      timerange: [{ start: new Date('2015-11-11'), end: new Date('2015-11-12') }]
    },
    {
      name: 'preset1',
      timerange: [{ start: new Date('2015-11-11'), end: new Date('2015-11-12') }]
    }]);
});
