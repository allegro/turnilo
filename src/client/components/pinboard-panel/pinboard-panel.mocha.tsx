import { expect } from 'chai';
import * as sinon from 'sinon';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import '../../utils/test-utils/index';

import * as TestUtils from 'react-addons-test-utils';

import { $, Expression } from 'plywood';
import { PinboardPanel } from './pinboard-panel';

describe.skip('PinboardPanel', () => {
  it('adds the correct class', () => {
    var renderedComponent = TestUtils.renderIntoDocument(
      <PinboardPanel
        clicker={null}
        essence={null}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((ReactDOM.findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('pinboard-panel');
  });

});
