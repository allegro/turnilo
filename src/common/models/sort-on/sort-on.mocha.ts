'use strict';

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { SortOn } from './sort-on';

describe('SortOn', () => {
  it('is an immutable class', () => {
    testImmutableClass(SortOn, [

      {
        measure: {
          name: 'price',
          title: 'Price',
          expression: $('main').min('$price').toJS()
        }
      },
      {
        measure: {
          expression: {
            action: {
              action: 'sum',
              expression: {
                name: 'price',
                op: 'ref'
              }
            },
            expression: {
              name: 'main',
              op: 'ref'
            },
            op: 'chain'
          },
          name: 'price',
          title: 'Price'
        }
      },
      {
        dimension: {
          name: 'country',
          title: 'important countries',
          'expression': {
            'op': 'literal',
            'value': { 'setType': 'STRING', 'elements': ['en'] },
            'type': 'SET'
          },
          kind: 'string'
        }
      }

    ]);
  });

});
