import { expect } from 'chai';
import * as sinon from 'sinon';
import * as React from 'react';
import * as TestUtils from 'react-addons-test-utils';
import { $, Expression } from 'plywood';

import { findDOMNode } from '../../utils/test-utils/index';

import { GlobalEventListener } from './global-event-listener';

describe('GlobalEventListener', () => {
  it('adds the correct class', () => {
    var renderedComponent = TestUtils.renderIntoDocument(
      <GlobalEventListener

      />
    );
  });

});
