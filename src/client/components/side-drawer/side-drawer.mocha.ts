'use strict';

import { expect } from 'chai';
import * as sinon from 'sinon';
import { setupDOM } from '../../utils/jsdom-setup';
import * as React from 'react/addons';
var { TestUtils } = React.addons;
var { Simulate } = TestUtils;

import { $, Expression } from 'plywood';
import { SideDrawer } from './side-drawer';

describe('SideDrawer', () => {
  setupDOM();

  it('adds the correct class', () => {
    var renderedComponent = TestUtils.renderIntoDocument(
      JSX(`
        <SideDrawer/>
      `)
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((<any>React.findDOMNode(renderedComponent)).className, 'should contain class').to.contain('side-drawer');
  });

});
