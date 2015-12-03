'use strict';

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { FilterClause } from './filter-clause';

describe('FilterClause', () => {
  it('is an immutable class', () => {
    testImmutableClass(FilterClause, [
      {
        expression: { op: 'ref', name: 'language' },
        values: {
          "setType": "STRING",
          "elements": ["en"]
        }
      },
      {
        expression: { op: 'ref', name: 'language' },
        values: {
          "setType": "STRING",
          "elements": ["en", null]
        }
      },
      {
        expression: { op: 'ref', name: 'language' },
        values: {
          "setType": "STRING",
          "elements": ["en"]
        },
        exclude: true
      },
      {
        expression: { op: 'ref', name: 'time' },
        values: {
          "setType": "TIME_RANGE",
          "elements": [{ start: new Date('2015-11-11'), end: new Date('2015-11-12') }]
        },
        exclude: true
      }
    ]);
  });

});
