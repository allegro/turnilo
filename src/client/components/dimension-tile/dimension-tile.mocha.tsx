import { expect } from 'chai';
import * as sinon from 'sinon';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import '../../utils/test-utils/index';

import * as TestUtils from 'react-addons-test-utils';

import { $, Expression } from 'plywood';
import { DimensionTile } from './dimension-tile';

import { EssenceMock, DimensionMock, SortOnMock } from '../../../common/models/mocks';

describe('DimensionTile', () => {
  it('adds the correct class', () => {
    var renderedComponent = TestUtils.renderIntoDocument(
      <DimensionTile
        clicker={null}
        dimension={DimensionMock.countryURL()}
        sortOn={SortOnMock.defaultA()}
        essence={EssenceMock.wiki()}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((ReactDOM.findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('dimension-tile');
  });

});
