'use strict';

import { expect } from 'chai';
import * as sinon from 'sinon';
import { setupDOM } from '../../utils/jsdom-setup';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as TestUtils from 'react-addons-test-utils';

import { $, Expression } from 'plywood';
import { Checkbox } from './checkbox';

describe('Checkbox', () => {
  setupDOM();

  it('adds the correct class', () => {
    var renderedComponent = TestUtils.renderIntoDocument(
      <Checkbox
        selected={true}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((ReactDOM.findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('checkbox');
  });

  it('not checked + check', () => {
    var onClick = sinon.spy();

    var renderedComponent = TestUtils.renderIntoDocument(
      <Checkbox selected={false} onClick={onClick}/>
    );

    var svgs = TestUtils.scryRenderedDOMComponentsWithTag(renderedComponent, 'svg');
    expect(svgs.length).to.equal(0);

    expect(onClick.callCount).to.equal(0);
    TestUtils.Simulate.click(ReactDOM.findDOMNode(renderedComponent));
    expect(onClick.callCount).to.equal(1);
  });
});
