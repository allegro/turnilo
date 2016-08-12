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
import { CollectionItemMock } from './collection-item.mock';
import { CollectionItem } from './collection-item';

describe('CollectionItem', () => {
  var context = CollectionItemMock.getContext();

  it('is an immutable class', () => {
    testImmutableClass(CollectionItem, [
      CollectionItemMock.testOneJS(),
      CollectionItemMock.testTwoJS()
    ], { context });
  });


  describe('errors', () => {
    it('must have context', () => {
      expect(() => {
        CollectionItem.fromJS({} as any);
      }).to.throw('must have context');
    });

  });

  describe('upgrades', () => {
    it('must add filter and timezone', () => {
      var linkItem = CollectionItem.fromJS({
        name: 'test1',
        title: 'Test One',
        description: 'I like testing',
        group: 'Tests',
        dataCube: 'wiki',
        essence: {
          visualization: 'line-chart',
          pinnedDimensions: ['articleName'],
          singleMeasure: "count",
          selectedMeasures: ['count'],
          splits: 'time'
        }
      }, context);

      expect(linkItem.toJS()).to.deep.equal({
        "dataCube": "wiki",
        "description": "I like testing",
        "essence": {
          "filter": {
            "action": {
              "action": "in",
              "expression": {
                "action": {
                  "action": "timeRange",
                  "duration": "P3D",
                  "step": -1
                },
                "expression": {
                  "name": "m",
                  "op": "ref"
                },
                "op": "chain"
              }
            },
            "expression": {
              "name": "time",
              "op": "ref"
            },
            "op": "chain"
          },
          "pinnedDimensions": [
            "articleName"
          ],
          "singleMeasure": "count",
          "selectedMeasures": [
            "count"
          ],
          "splits": [
            {
              "bucketAction": {
                "action": "timeBucket",
                "duration": "PT1H"
              },
              "expression": {
                "name": "time",
                "op": "ref"
              },
              "sortAction": {
                "action": "sort",
                "direction": "ascending",
                "expression": {
                  "name": "time",
                  "op": "ref"
                }
              }
            }
          ],
          "timezone": "Etc/UTC",
          "visualization": "line-chart"
        },
        "group": "Tests",
        "name": "test1",
        "title": "Test One"
      });
    });

  });

});
