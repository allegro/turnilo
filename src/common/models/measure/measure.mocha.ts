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

import { $, AttributeInfo } from 'plywood';
import { Measure, MeasureJS } from './measure';

describe('Measure', () => {
  it('is an immutable class', () => {
    testImmutableClass<MeasureJS>(Measure, [
      {
        name: 'price',
        title: 'Price',
        formula: '$main.sum($price)'
      },
      {
        name: 'avg_price',
        title: 'Average Price',
        formula: '$main.average($price)'
      }
    ]);
  });

  describe('.measuresFromAttributeInfo', () => {
    it('works with sum', () => {
      var attribute = AttributeInfo.fromJS({
        "name": "price",
        "type": "NUMBER",
        "unsplitable": true,
        "makerAction": {
          "action": "sum",
          "expression": {
            "name": "price",
            "op": "ref"
          }
        }
      });
      var measures = Measure.measuresFromAttributeInfo(attribute).map((m => m.toJS()));
      expect(measures).to.deep.equal([
        {
          "name": "price",
          "title": "Price",
          "formula": "$main.sum($price)"
        }
      ]);
    });

    it('works with min', () => {
      var attribute = AttributeInfo.fromJS({
        "name": "price",
        "type": "NUMBER",
        "unsplitable": true,
        "makerAction": {
          "action": "min",
          "expression": {
            "name": "price",
            "op": "ref"
          }
        }
      });
      var measures = Measure.measuresFromAttributeInfo(attribute).map((m => m.toJS()));
      expect(measures).to.deep.equal([
        {
          "name": "price",
          "title": "Price",
          "formula": "$main.min($price)"
        }
      ]);
    });

    it('works with max', () => {
      var attribute = AttributeInfo.fromJS({
        "name": "price",
        "type": "NUMBER",
        "unsplitable": true,
        "makerAction": {
          "action": "max",
          "expression": {
            "name": "price",
            "op": "ref"
          }
        }
      });

      var measures = Measure.measuresFromAttributeInfo(attribute).map((m => m.toJS()));
      expect(measures).to.deep.equal([
        {
          "name": "price",
          "title": "Price",
          "formula": "$main.max($price)"
        }
      ]);
    });

    it('works with histogram', () => {
      var attribute = AttributeInfo.fromJS({
        "name": "delta_hist",
        "special": "histogram",
        "type": "NUMBER"
      });

      var measures = Measure.measuresFromAttributeInfo(attribute).map((m => m.toJS()));
      expect(measures).to.deep.equal([
        {
          "name": "delta_hist_p98",
          "title": "Delta Hist P98",
          "formula": "$main.quantile($delta_hist,0.98)"
        }
      ]);
    });

    it('works with unique', () => {
      var attribute = AttributeInfo.fromJS({
        "name": "unique_page",
        "special": "unique",
        "type": "STRING"
      });
      var measures = Measure.measuresFromAttributeInfo(attribute).map((m => m.toJS()));
      expect(measures).to.deep.equal([
        {
          "name": "unique_page",
          "title": "Unique Page",
          "formula": "$main.countDistinct($unique_page)"
        }
      ]);
    });

    it('works with theta', () => {
      var attribute = AttributeInfo.fromJS({
        "name": "page_theta",
        "special": "theta",
        "type": "STRING"
      });
      var measures = Measure.measuresFromAttributeInfo(attribute).map((m => m.toJS()));
      expect(measures).to.deep.equal([
        {
          "name": "page_theta",
          "title": "Page Theta",
          "formula": "$main.countDistinct($page_theta)"
        }
      ]);
    });

  });
});
