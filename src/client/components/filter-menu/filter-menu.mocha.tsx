import { expect } from 'chai';
import * as sinon from 'sinon';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { findDOMNode } from '../../utils/test-utils/index';

import * as TestUtils from 'react-addons-test-utils';

import { $, Expression } from 'plywood';
import { FilterMenu } from './filter-menu';

import { EssenceMock, StageMock, DimensionMock } from '../../../common/models/mocks';

describe('FilterMenu', () => {
  it('adds the correct class', () => {
    var openOn = document.createElement('div');

    var renderedComponent = TestUtils.renderIntoDocument(
      <FilterMenu
        clicker={null}
        containerStage={null}
        dimension={DimensionMock.countryURL()}
        direction={'down'}
        essence={EssenceMock.wiki()}
        changePosition={null}
        onClose={null}
        openOn={openOn}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('filter-menu');
  });

});
