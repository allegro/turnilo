import { expect } from 'chai';
import * as sinon from 'sinon';
import '../../utils/jsdom-setup';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../../utils/require-extensions';

import * as TestUtils from 'react-addons-test-utils';

import { $, Expression } from 'plywood';
import { BubbleMenu } from './bubble-menu';

import { StageMock } from '../../../common/models/mocks';
import { BodyPortalMock } from '../body-portal/body-portal.mock';

describe('BubbleMenu', () => {
  BodyPortalMock.disableBodyPortal();

  it('adds the correct class', () => {
    var openOn = document.createElement('div');

    var renderedComponent = TestUtils.renderIntoDocument(
      <BubbleMenu
        children={null}
        className={null}
        containerStage={null}
        direction={'right'}
        onClose={null}
        openOn={openOn}
        stage={StageMock.defaultA()}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((ReactDOM.findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('bubble-menu');
  });

});
