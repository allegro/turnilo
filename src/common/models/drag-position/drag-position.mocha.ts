import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { DragPosition } from './drag-position';

describe('DragPosition', () => {
  it('is an immutable class', () => {
    testImmutableClass(DragPosition, [
      {
        insert: 0
      },
      {
        insert: 2
      },
      {
        replace: 0
      },
      {
        replace: 1
      }
    ]);
  });

});
