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

import { $, Expression } from 'plywood';
import { SortOn, SortOnJS } from './sort-on';

describe('SortOn', () => {
  it('is an immutable class', () => {
    testImmutableClass<SortOnJS>(SortOn, [

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
