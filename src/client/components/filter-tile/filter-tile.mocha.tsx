import { expect } from 'chai';
import * as sinon from 'sinon';
import '../../utils/jsdom-setup';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../../utils/require-extensions';
import * as TestUtils from 'react-addons-test-utils';
import { mockRequireEnsure } from '../../utils/test-utils/index';

import { $, Expression } from 'plywood';
import { EssenceMock, StageMock, DimensionMock } from '../../../common/models/mocks';

describe('FilterTile', () => {
  var { FilterTile } = mockRequireEnsure('./filter-tile');

  it('adds the correct class', () => {
    var renderedComponent = TestUtils.renderIntoDocument(
      <FilterTile
        clicker={null}
        essence={EssenceMock.wiki()}
        menuStage={null}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((ReactDOM.findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('filter-tile');
  });

});
