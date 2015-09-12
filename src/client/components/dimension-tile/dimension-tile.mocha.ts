'use strict';

import { expect } from 'chai';
import * as sinon from 'sinon';
import { setupDOM } from '../../utils/jsdom-setup';
import * as React from 'react/addons';
var { TestUtils } = React.addons;
var { Simulate } = TestUtils;

import { $, Expression } from 'plywood';
import { DimensionTile } from './dimension-tile';

describe('DimensionTile', () => {
  setupDOM();

  it('adds the correct class', () => {
    var renderedComponent = TestUtils.renderIntoDocument(
      JSX(`
        <DimensionTile/>
      `)
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((<any>React.findDOMNode(renderedComponent)).className, 'should contain class').to.contain('dimension-tile');
  });

});
