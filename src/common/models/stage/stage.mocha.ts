'use strict';

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { Stage, StageJS } from './stage';

describe('Stage', () => {
  it('is an immutable class', () => {
    testImmutableClass<StageJS>(Stage, [
      {
        x: 10,
        y: 5,
        height: 2,
        width: 2
      },
      {
        x: 10,
        y: 500,
        height: 2,
        width: 2
      },
      {
        x: 10,
        y: 5,
        height: 3,
        width: 2
      }
    ]);
  });

});
