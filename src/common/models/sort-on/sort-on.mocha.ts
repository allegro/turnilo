'use strict';

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { SortOn } from './sort-on';

describe('SortOn', () => {
  it('is an immutable class', () => {
    testImmutableClass(SortOn, [

    ]);
  });

});
