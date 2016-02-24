import { expect } from 'chai';
import * as sinon from 'sinon';
import '../../utils/jsdom-setup';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../../utils/require-extensions';

import * as TestUtils from 'react-addons-test-utils';

import { $, Expression } from 'plywood';
import { CubeView } from './cube-view';

describe('CubeView', () => {
  it.skip('adds the correct class', () => {
    var renderedComponent = TestUtils.renderIntoDocument(
      <CubeView
        hash={null}
        selectedDataSource={null}
        updateHash={null}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((ReactDOM.findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('cube-view');

  });
});


