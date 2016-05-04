import { expect } from 'chai';
import * as sinon from 'sinon';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import '../../utils/test-utils/index';

import * as TestUtils from 'react-addons-test-utils';

import { $, Expression } from 'plywood';
import { LinkView } from './link-view';

describe('LinkView', () => {
  it.skip('adds the correct class', () => {
    var renderedComponent = TestUtils.renderIntoDocument(
      <LinkView
        linkViewConfig={null}
        hash={null}
        updateViewHash={null}
        changeHash={null}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((ReactDOM.findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('link-view');

  });
});


