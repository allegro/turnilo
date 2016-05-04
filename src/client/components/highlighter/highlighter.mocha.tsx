import { expect } from 'chai';
import * as sinon from 'sinon';
import '../../utils/jsdom-setup';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../../utils/require-extensions';

import * as TestUtils from 'react-addons-test-utils';

import { TimeRange } from 'plywood';
import { Highlighter } from './highlighter';

describe('Highlighter', () => {
  it('adds the correct class', () => {
    var fakeTimeRange = TimeRange.fromJS({
      start: new Date('2015-01-26T04:54:10Z'),
      end: new Date('2015-01-26T05:54:10Z')
    });

    var myScaleX = (value: any) => { return 42; };

    var renderedComponent = TestUtils.renderIntoDocument(
      <Highlighter
        highlightTimeRange={fakeTimeRange}
        scaleX={myScaleX}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((ReactDOM.findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('highlighter');
  });

});
