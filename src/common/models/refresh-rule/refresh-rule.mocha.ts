import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { RefreshRule, RefreshRuleJS } from './refresh-rule';

describe('RefreshRule', () => {
  it('is an immutable class', () => {
    testImmutableClass<RefreshRuleJS>(RefreshRule, [
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
        rule: 'realtime',
        refresh: 'PT1M'
      }
    ]);
  });

  describe('Auto refresh rate', () => {
    it("works for query", () => {
      expect(RefreshRule.fromJS({ rule: 'query' }).toJS()).to.deep.equal({
        rule: 'query',
        refresh: 'PT1M'
      });
    });

    it("works for realtime", () => {
      expect(RefreshRule.fromJS({ rule: 'realtime' }).toJS()).to.deep.equal({
        rule: 'realtime',
        refresh: 'PT1M'
      });
    });

  });

});
