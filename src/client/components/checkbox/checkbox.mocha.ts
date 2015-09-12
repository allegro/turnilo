'use strict';

import { expect } from 'chai';
import * as sinon from 'sinon';
import { setupDOM } from '../../utils/jsdom-setup';
import * as React from 'react/addons';
var { TestUtils } = React.addons;
var { Simulate } = TestUtils;

import { $, Expression } from 'plywood';
import { Checkbox } from './checkbox';

describe('Checkbox', () => {
  setupDOM();

  it('adds the correct class', () => {
    var renderedComponent = TestUtils.renderIntoDocument(
      JSX(`
        <Checkbox/>
      `)
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((<any>React.findDOMNode(renderedComponent)).className, 'should contain class').to.contain('checkbox');
  });

  it('not checked + check', () => {
    var onClick = sinon.spy();

    var renderedComponent = TestUtils.renderIntoDocument(
      JSX(`
        <Checkbox checked={false} onClick={onClick}/>
      `)
    );

    var svgs = TestUtils.scryRenderedDOMComponentsWithTag(renderedComponent, 'svg');
    expect(svgs.length).to.equal(0);

    expect(onClick.callCount).to.equal(0);
    Simulate.click(React.findDOMNode(renderedComponent));
    expect(onClick.callCount).to.equal(1);
  });
});
