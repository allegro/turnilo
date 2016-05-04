import { expect } from 'chai';
import * as sinon from 'sinon';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { mockRequireEnsure } from '../../utils/test-utils/index';

import * as TestUtils from 'react-addons-test-utils';

import { EssenceMock } from '../../../common/models/mocks';

import { $, Expression } from 'plywood';

describe('DimensionListTile', () => {
  var { DimensionListTile } = mockRequireEnsure('./dimension-list-tile');

  it('adds the correct class', () => {
    var renderedComponent = TestUtils.renderIntoDocument(
      <DimensionListTile
        clicker={null}
        essence={EssenceMock.wiki()}
        menuStage={null}
        triggerFilterMenu={null}
        triggerSplitMenu={null}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((ReactDOM.findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('dimension-list-tile');
  });

});
