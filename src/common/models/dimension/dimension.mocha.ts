import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

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
        kind: 'string',
        granularities: [5, 50, 500, 800, 1000]
      },
      {
        name: 'country',
        title: 'important countries',
        'expression': {
          'op': 'literal',
          'value': { 'setType': 'STRING', 'elements': ['en'] },
          'type': 'SET'
        },
        kind: 'string',
        url: 'https://www.country.com/%s',
        bucketedBy: 1
      },
      {
        name: 'time',
        title: 'time',
        'expression': {
          'op': 'literal',
          'value': { 'start': new Date('2013-02-26T19:00:00.000Z'), 'end': new Date('2013-02-26T22:00:00.000Z') },
          'type': 'TIME_RANGE'
        },
        kind: 'time',
        url: 'http://www.time.com/%s',
        granularities: ['PT1M', { action: 'timeBucket', duration: 'P6M', timezone: 'Etc/UTC' }, 'PT6H', 'P1D', 'P1W']
      },
      {
        name: 'time',
        title: 'time',
        'expression': {
          'op': 'literal',
          'value': { 'start': new Date('2013-02-26T19:00:00.000Z'), 'end': new Date('2013-02-26T22:00:00.000Z') },
          'type': 'TIME_RANGE'
        },
        kind: 'time',
        url: 'http://www.time.com/%s',
        granularities: ['PT1M', 'P6M', 'PT6H', 'P1D', 'P1W'],
        bucketedBy: 'PT6H'
      }
    ]);
  });

  it('throws on invalid type', () => {
    var dimJS = {
        name: 'mixed granularities',
        title: 'Mixed Granularities',
        kind: 'string',
        granularities: [5, 50, 'P1W', 800, 1000]
      };

    expect(() => { Dimension.fromJS(dimJS); }).to.throw("granularities must have the same type of actions");

    var dimJS2 = {
      name: 'bad type',
      title: 'Bad Type',
      kind: 'string',
      granularities: [false, true, true, false, false]
    };

    expect(() => { Dimension.fromJS(dimJS2); }).to.throw("input should be of type number, string, or action");

  });

});
