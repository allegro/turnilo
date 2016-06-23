import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class/build/tester';

import { LinkViewConfigMock } from './link-view-config.mock';
import { LinkViewConfig } from './link-view-config';

describe('LinkViewConfig', () => {
  var context = LinkViewConfigMock.getContext();

  it('is an immutable class', () => {
    testImmutableClass(LinkViewConfig, [
      LinkViewConfigMock.testOneOnlyJS(),
      LinkViewConfigMock.testOneTwoJS()
    ], { context });
  });

});
