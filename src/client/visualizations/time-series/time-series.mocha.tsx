import { expect } from 'chai';
import * as sinon from 'sinon';
import '../../utils/test-utils/index';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as TestUtils from 'react-addons-test-utils';

import { $, Expression } from 'plywood';
import { TimeSeries } from './time-series';

describe.skip('TimeSeries', () => {
  it('adds the correct class', () => {
    var renderedComponent = TestUtils.renderIntoDocument(
      <TimeSeries
        clicker={null}
        essence={null}
        stage={null}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((ReactDOM.findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('time-series');
  });
});
