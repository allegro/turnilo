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
import { testImmutableClass } from 'immutable-class/build/tester';

import { Dimension, DimensionJS } from './dimension';

describe('Dimension', () => {
  it('is an immutable class', () => {
    testImmutableClass<DimensionJS>(Dimension, [
      {
        name: 'country',
        title: 'important countries',
        formula: '$country',
        kind: 'string',
        granularities: [5, 50, 500, 800, 1000],
        sortStrategy: 'self'
      },
      {
        name: 'country',
        title: 'important countries',
        formula: '$country',
        kind: 'string',
        url: 'https://www.country.com/%s',
        bucketedBy: 1,
        bucketingStrategy: 'alwaysBucket'
      },
      {
        name: 'time',
        title: 'time',
        formula: '$time',
        kind: 'time',
        url: 'http://www.time.com/%s',
        granularities: ['PT1M', { action: 'timeBucket', duration: 'P6M', timezone: 'Etc/UTC' }, 'PT6H', 'P1D', 'P1W']
      },
      {
        name: 'time',
        title: 'time',
        formula: '$time',
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
