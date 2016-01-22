'use strict';

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { Splits } from './splits';

describe('Splits', () => {
  it('is an immutable class', () => {
    testImmutableClass(Splits, [
        [
            {
                expression: { op: 'ref', name: 'language' }
            }
        ],
        [
          {
              expression: { op: 'ref', name: 'time'}

          }
        ]
    ]);
  });
});
