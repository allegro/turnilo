import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { Splits, SplitsJS } from './splits';

describe('Splits', () => {
  it('is an immutable class', () => {
    testImmutableClass<SplitsJS>(Splits, [
      [
        {
          expression: { op: 'ref', name: 'language' }
        }
      ],
      [
        {
          expression: { op: 'ref', name: 'time' }

        }
      ],
      [
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
        },
        {
          expression: { op: 'ref', name: 'time' }

        },
        {
          expression: { op: 'ref', name: 'time' }

        }
      ]
    ]);
  });
});
