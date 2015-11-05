'use strict';

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { Measure } from './measure';

describe('Measure', () => {
  it('is an immutable class', () => {
    testImmutableClass(Measure, [
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

  describe('.getExpressionForName', () => {
    it('works with sum', () => {
      var ex1 = Measure.getExpressionForName('price');
      var ex2 = $('main').sum('$price');
      expect(ex1.toJS()).to.deep.equal(ex2.toJS());
    });

    it('works with min', () => {
      var ex1 = Measure.getExpressionForName('min_price');
      var ex2 = $('main').min('$min_price');
      expect(ex1.toJS()).to.deep.equal(ex2.toJS());
    });

    it('works with max', () => {
      var ex1 = Measure.getExpressionForName('max_price');
      var ex2 = $('main').max('$max_price');
      expect(ex1.toJS()).to.deep.equal(ex2.toJS());
    });
  });
});
