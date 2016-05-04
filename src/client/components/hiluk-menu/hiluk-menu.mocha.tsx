import { expect } from 'chai';
import * as sinon from 'sinon';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-addons-test-utils';
import { findDOMNode } from '../../utils/test-utils/index';
import { EssenceMock } from '../../../common/models/mocks';

import { $, Expression } from 'plywood';
import { HilukMenu } from './hiluk-menu';

describe.skip('HilukMenu', () => {
  it('adds the correct class', () => {
    var openOn = document.createElement('div');

    var renderedComponent = TestUtils.renderIntoDocument(
      <HilukMenu
        essence={EssenceMock.wiki()}
        onClose={null}
        openOn={openOn}
        getUrlPrefix={() => { return 'http://stackoverflow.com/'; }}
        openRawDataModal={null}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('hiluk-menu');
  });

});
