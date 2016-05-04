import { expect } from 'chai';
import * as sinon from 'sinon';
import '../../utils/jsdom-setup';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../../utils/require-extensions';

import * as TestUtils from 'react-addons-test-utils';
import { findDOMNode } from '../../utils/test-utils/index';

import { $, Expression } from 'plywood';
import { DimensionActionsMenu } from './dimension-actions-menu';

import { EssenceMock, StageMock, DimensionMock } from '../../../common/models/mocks';

describe('DimensionActionsMenu', () => {
  it('adds the correct class', () => {
    var openOn = document.createElement('div');

    var renderedComponent = TestUtils.renderIntoDocument(
      <DimensionActionsMenu
        clicker={null}
        containerStage={StageMock.defaultA()}
        dimension={DimensionMock.countryURL()}
        direction={'right'}
        essence={EssenceMock.wiki()}
        onClose={null}
        openOn={openOn}
        triggerFilterMenu={null}
        triggerSplitMenu={null}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('dimension-actions-menu');
  });

});
