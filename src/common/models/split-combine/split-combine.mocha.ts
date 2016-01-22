'use strict';

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { SplitCombine } from './split-combine';

describe('SplitCombine', () => {
    it('is an immutable class', () => {
        testImmutableClass(SplitCombine, [
            {
                expression: {op: 'ref', name: 'language'}
            },
            {
                expression: {op: 'lookup', name: 'lookup'}
            }
        ]);
    });
});
