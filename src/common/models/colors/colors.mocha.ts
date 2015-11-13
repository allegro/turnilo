'use strict';

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { Colors } from './colors';

describe('Colors', () => {
  it('is an immutable class', () => {
    testImmutableClass(Colors, [

    ]);
  });

});
