import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { $, Expression } from 'plywood';
import { LinkViewConfig } from './link-view-config';

describe('LinkViewConfig', () => {
  it('is an immutable class', () => {
    testImmutableClass(LinkViewConfig, [

    ]);
  });

});
