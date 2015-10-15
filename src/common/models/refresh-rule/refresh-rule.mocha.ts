'use strict';

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { RefreshRule } from './refresh-rule';

describe('RefreshRule', () => {
  it('is an immutable class', () => {
    testImmutableClass(RefreshRule, [
      {
        rule: 'fixed',
        time: new Date("2015-10-15T19:21:00Z")
      },
      {
        rule: 'query',
        refresh: 'P1D'
      },
      {
        rule: 'query',
        refresh: 'PT1M'
      },
      {
        rule: 'realtime'
      }
    ]);
  });

});
