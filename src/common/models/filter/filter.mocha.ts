'use strict';

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { Filter } from "./filter";

describe('Filter', () => {
  it('is an immutable class', () => {
    testImmutableClass(Filter, [
      [],
      [{
        "op": "chain", "expression": { "op": "ref", "name": "time" },
        "actions": [{
          "action": "in",
          "expression": {
            "op": "literal",
            "value": { "start": new Date("2013-02-26T19:00:00.000Z"), "end": new Date("2013-02-26T22:00:00.000Z") },
            "type": "TIME_RANGE"
          }
        }]
      }],
      [{
        "op": "chain", "expression": { "op": "ref", "name": "language" },
        "actions": [{
          "action": "in",
          "expression": {
            "op": "literal",
            "value": { "setType": "STRING", "elements": ["en"] },
            "type": "SET"
          }
        }]
      }],
      [{
        "op": "chain", "expression": { "op": "ref", "name": "language" },
        "actions": [{
          "action": "in",
          "expression": {
            "op": "literal",
            "value": { "setType": "STRING", "elements": ["he"] },
            "type": "SET"
          }
        }]
      }]
    ]);
  });

  it('works in empty case', () => {
    var filter = Filter.EMPTY;

    expect(filter.toExpression().toJS()).to.deep.equal({
      "op": "literal",
      "value": true
    });
  });

  it('add work', () => {
    var filter = Filter.EMPTY;

    filter = filter.addValue($('language'), 'en');

    expect(filter.toExpression().toJS()).to.deep.equal({
      "actions": [
        {
          "action": "in",
          "expression": {
            "op": "literal",
            "type": "SET",
            "value": {
              "elements": [
                "en"
              ],
              "setType": "STRING"
            }
          }
        }
      ],
      "expression": {
        "name": "language",
        "op": "ref"
      },
      "op": "chain"
    });
  });
});
