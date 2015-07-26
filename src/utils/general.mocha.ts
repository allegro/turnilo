'use strict';

import { expect } from 'chai';

import { findFirstIndex, moveInArray } from './general';

describe('General', () => {
  describe('findFirstIndex', () => {
    it('works in simple case', () => {
      var array = [1, 5, 6, 2, 1, 8];
      expect(findFirstIndex(array, (x) => x === 6)).to.equal(2);
    });

    it('works when there is no index', () => {
      var array = [1, 5, 6, 2, 1, 8];
      expect(findFirstIndex(array, (x) => x > 8)).to.equal(-1);
    });
  });

  describe('moveInArray', () => {
    it('works in simple case 0', () => {
      var array = "ABCD".split('');
      expect(moveInArray(array, 0, 0).join('')).to.equal('ABCD');
    });

    it('works in simple case 1', () => {
      var array = "ABCD".split('');
      expect(moveInArray(array, 0, 1).join('')).to.equal('ABCD');
    });

    it('works in simple case 2', () => {
      var array = "ABCD".split('');
      expect(moveInArray(array, 0, 2).join('')).to.equal('BACD');
    });

    it('works in simple case 3', () => {
      var array = "ABCD".split('');
      expect(moveInArray(array, 0, 3).join('')).to.equal('BCAD');
    });

    it('works in simple case 4', () => {
      var array = "ABCD".split('');
      expect(moveInArray(array, 0, 4).join('')).to.equal('BCDA');
    });
  });
});


