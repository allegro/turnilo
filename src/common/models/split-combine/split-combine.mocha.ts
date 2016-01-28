'use strict';

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { SplitCombine, SplitCombineJS } from './split-combine';

describe('SplitCombine', () => {
  it('is an immutable class', () => {
    testImmutableClass<SplitCombineJS>(SplitCombine, [
      {
        expression: { op: 'ref', name: 'language' }
      },
      {
        expression: { op: 'ref', name: 'lookup' }
      },
      {
        expression: { op: 'ref', name: 'time' },
        bucketAction: {
          action: 'in',
          expression: {
            'op': 'literal',
            'value': { 'setType': 'STRING', 'elements': ['he'] },
            'type': 'SET'
          }
        },
        sortAction: {
          action: 'sort',
          direction: 'ascending',
          expression: {
            op: 'ref',
            name: 'time'
          }
        },
        limitAction: {
          action: 'limit',
          limit: 2
        }
      }
    ]);
  });
});
