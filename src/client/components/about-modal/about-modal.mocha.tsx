import { expect } from 'chai';
import * as sinon from 'sinon';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { findDOMNode } from '../../utils/test-utils/index';
import * as TestUtils from 'react-addons-test-utils';
import { AboutModal } from './about-modal';


describe('AboutModal', () => {

  it('adds the correct class', () => {
    var renderedComponent = TestUtils.renderIntoDocument(
      <AboutModal
        onClose={null}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('about-modal');
  });
});
