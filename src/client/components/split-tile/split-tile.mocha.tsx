import { expect } from 'chai';
import * as sinon from 'sinon';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { mockRequireEnsure } from '../../utils/test-utils/index';

import { EssenceMock } from '../../../common/models/mocks';

import * as TestUtils from 'react-addons-test-utils';


describe('SplitTile', () => {

  var { SplitTile } = mockRequireEnsure('./split-tile');

  it('adds the correct class', () => {
    var renderedComponent = TestUtils.renderIntoDocument(
      <SplitTile
        clicker={null}
        essence={EssenceMock.wiki()}
        menuStage={null}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((ReactDOM.findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('split-tile');
  });
});
