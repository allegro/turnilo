'use strict';

import { expect } from 'chai';

import { List } from 'immutable';
import { moveInList } from './general';

describe('General', () => {
  describe('moveInList', () => {
    it('works in simple case 0', () => {
      var list = List("ABCD".split(''));
      expect(moveInList(list, 0, 0).join('')).to.equal('ABCD');
    });

    it('works in simple case 1', () => {
      var list = List("ABCD".split(''));
      expect(moveInList(list, 0, 1).join('')).to.equal('ABCD');
    });

    it('works in simple case 2', () => {
      var list = List("ABCD".split(''));
      expect(moveInList(list, 0, 2).join('')).to.equal('BACD');
    });

    it('works in simple case 3', () => {
      var list = List("ABCD".split(''));
      expect(moveInList(list, 0, 3).join('')).to.equal('BCAD');
    });

    it('works in simple case 4', () => {
      var list = List("ABCD".split(''));
      expect(moveInList(list, 0, 4).join('')).to.equal('BCDA');
    });
  });
});


