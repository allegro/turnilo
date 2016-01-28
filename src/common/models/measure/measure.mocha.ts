'use strict';

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression, AttributeInfo } from 'plywood';
import { Measure, MeasureJS } from './measure';

describe('Measure', () => {
  it('is an immutable class', () => {
    testImmutableClass<MeasureJS>(Measure, [
      {
        name: 'price',
        title: 'Price',
        expression: $('main').sum('$price').toJS()
      },
      {
        name: 'avg_price',
        title: 'Average Price',
        expression: $('main').average('$price').toJS()
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
          "expression": {
            "action": {
              "action": "sum",
              "expression": {
                "name": "price",
                "op": "ref"
              }
            },
            "expression": {
              "name": "main",
              "op": "ref"
            },
            "op": "chain"
          },
          "name": "price",
          "title": "Price"
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
          "expression": {
            "action": {
              "action": "min",
              "expression": {
                "name": "price",
                "op": "ref"
              }
            },
            "expression": {
              "name": "main",
              "op": "ref"
            },
            "op": "chain"
          },
          "name": "price",
          "title": "Price"
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
          "expression": {
            "action": {
              "action": "max",
              "expression": {
                "name": "price",
                "op": "ref"
              }
            },
            "expression": {
              "name": "main",
              "op": "ref"
            },
            "op": "chain"
          },
          "name": "price",
          "title": "Price"
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
      expect(measures).to.deep.equal([]);
    });

    it('works with max', () => {
      var attribute = AttributeInfo.fromJS({
        "name": "unique_page",
        "special": "unique",
        "type": "STRING"
      });
      var measures = Measure.measuresFromAttributeInfo(attribute).map((m => m.toJS()));
      expect(measures).to.deep.equal([
        {
          "expression": {
            "action": {
              "action": "countDistinct",
              "expression": {
                "name": "unique_page",
                "op": "ref"
              }
            },
            "expression": {
              "name": "main",
              "op": "ref"
            },
            "op": "chain"
          },
          "name": "unique_page",
          "title": "Unique Page"
        }
      ]);
    });

  });
});
