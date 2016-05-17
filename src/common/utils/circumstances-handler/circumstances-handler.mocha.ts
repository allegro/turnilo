import { expect } from 'chai';

import { CircumstancesHandler } from './circumstances-handler';

describe('dimension kind matcher', () => {
  let strictCompare = CircumstancesHandler.strictCompare;

  it('should work in various cases', () => {
    var cases: any[] = [
      [[], [], true],
      [['time'], ['time'], true],
      [['time', '*'], ['pouet', 'time'], false],
      [['time', '*'], ['time', 'tut'], true],
      [['!time'], ['pouet'], true],
      [['!time'], ['time'], false],
      [['*'], ['time'], true]
    ];

    cases.forEach((c, i) => {
      expect(strictCompare(c[0], c[1])).to.equal(c[2], `test case #${i}`);
    });
  });
});
