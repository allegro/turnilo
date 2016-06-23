import { expect } from 'chai';
import * as React from 'react';
import * as TestUtils from 'react-addons-test-utils';
import { EssenceMock, DimensionMock } from '../../../common/models/mocks';

import { findDOMNode } from '../../utils/test-utils/index';

import { NumberFilterMenu } from './number-filter-menu';

describe('NumberFilterMenu', () => {
  it('adds the correct class', () => {
    var renderedComponent = TestUtils.renderIntoDocument(
      <NumberFilterMenu
        clicker={null}
        dimension={DimensionMock.time()}
        essence={EssenceMock.wikiTotals()}
        onClose={null}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('number-filter-menu');
  });

});
