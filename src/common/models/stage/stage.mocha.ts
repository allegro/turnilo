import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { Stage, StageJS } from './stage';
import { StageMock } from './stage.mock';

describe('Stage', () => {
  it('is an immutable class', () => {
    testImmutableClass<StageJS>(Stage, [
      StageMock.DEFAULT_A_JS,
      StageMock.DEFAULT_B_JS,
      StageMock.DEFAULT_C_JS
    ]);
  });

});
