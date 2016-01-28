'use strict';

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { Dimension, DimensionJS } from './dimension';

describe('Dimension', () => {
  it('is an immutable class', () => {
    testImmutableClass<DimensionJS>(Dimension, [
      {
        name: 'country',
        title: 'important countries',
        'expression': {
          'op': 'literal',
          'value': { 'setType': 'STRING', 'elements': ['en'] },
          'type': 'SET'
        },
        kind: 'string'
      },
      {
        name: 'time',
        title: 'time',
        'expression': {
          'op': 'literal',
          'value': { 'start': new Date('2013-02-26T19:00:00.000Z'), 'end': new Date('2013-02-26T22:00:00.000Z') },
          'type': 'TIME_RANGE'
        },
        kind: 'time'
      }
    ]);
  });

  describe('methods', () => {
  });

});
