import { expect } from 'chai';
import * as sinon from 'sinon';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import '../../utils/test-utils/index';

import * as TestUtils from 'react-addons-test-utils';
import { EssenceMock } from '../../../common/models/mocks';

import { $, Expression } from 'plywood';
import { CubeHeaderBar } from './cube-header-bar';

describe('CubeHeaderBar', () => {
  it('adds the correct class', () => {
    var renderedComponent = TestUtils.renderIntoDocument(
      <CubeHeaderBar
        clicker={null}
        essence={EssenceMock.wikiTotals()}
        onNavClick={null}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((ReactDOM.findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('cube-header-bar');
  });

});
