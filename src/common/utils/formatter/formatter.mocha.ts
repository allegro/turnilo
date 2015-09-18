'use strict';

import { expect } from 'chai';

import { List } from 'immutable';
import { getMiddleNumber, formatterFromData } from './formatter';

describe('General', () => {
  describe('getMiddleNumber', () => {
    it('works in simple case', () => {
      var values = [100, 10, 1, 0];
      expect(getMiddleNumber(values)).to.equal(10);
    });

    it('works in more complex case', () => {
      var values = [0, 0, -1000, -100, 10, 1, 0, 0, 0, 0];
      expect(getMiddleNumber(values)).to.equal(10);
    });
  });

  describe('formatterFromData', () => {
    it('works in simple case', () => {
      var values = [100, 10, 1, 0];
      var formatter = formatterFromData(values, '0,0 a');
      expect(formatter(10)).to.equal('10');
    });

    it('works in k case', () => {
      var values = [50000, 5000, 5000, 5000, 5000, 100, 10, 1, 0];
      var formatter = formatterFromData(values, '0,0.000 a');
      expect(formatter(10)).to.equal('0.010 k');
      expect(formatter(12345)).to.equal('12.345 k');
    });

    it('works in KB case', () => {
      var values = [50000, 5000, 5000, 5000, 5000, 100, 10, 1, 0];
      var formatter = formatterFromData(values, '0,0.000 b');
      expect(formatter(10)).to.equal('0.010 KB');
      expect(formatter(12345)).to.equal('12.056 KB');
    });
  });
});
