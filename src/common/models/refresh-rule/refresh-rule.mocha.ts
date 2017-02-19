/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class-tester';

import { $, Expression } from 'swiv-plywood';
import { RefreshRule, RefreshRuleJS } from './refresh-rule';

describe('RefreshRule', () => {
  it('is an immutable class', () => {
    testImmutableClass<RefreshRuleJS>(RefreshRule, [
      {
        rule: 'fixed',
        time: new Date("2015-10-15T19:21:00Z")
      },
      {
        rule: 'query'
      },
      {
        rule: 'realtime'
      }
    ]);
  });

  describe('Auto refresh rate', () => {
    it("works for query", () => {
      expect(RefreshRule.fromJS({ rule: 'query' }).toJS()).to.deep.equal({
        rule: 'query'
      });
    });

    it("works for realtime", () => {
      expect(RefreshRule.fromJS({ rule: 'realtime' }).toJS()).to.deep.equal({
        rule: 'realtime'
      });
    });

  });

});
