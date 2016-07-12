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

import { SortOn, SortOnJS } from './sort-on';
import { $ } from 'plywood';

export class SortOnMock {
  public static get DEFAULT_A_JS(): SortOnJS {
    return {
      measure: {
        name: 'price',
        title: 'Price',
        expression: $('main').min('$price').toJS()
      }
    };
  }

  public static get DEFAULT_B_JS(): SortOnJS {
    return {
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
    };
  }

  public static get DEFAULT_C_JS(): SortOnJS {
    return {
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
    };
  }

  static defaultA() {
    return SortOn.fromJS(SortOnMock.DEFAULT_A_JS);
  }

  static defaultB() {
    return SortOn.fromJS(SortOnMock.DEFAULT_B_JS);
  }

  static defaultC() {
    return SortOn.fromJS(SortOnMock.DEFAULT_C_JS);
  }
}
