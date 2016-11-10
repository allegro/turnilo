import { expect } from 'chai';
import * as sinon from 'sinon';
import * as React from 'react';
import * as TestUtils from 'react-addons-test-utils';
import { $, Expression } from 'plywood';

import { findDOMNode } from '../../utils/test-utils/index';
import { TimekeeperMock } from '../../../common/models/mocks';

import { AddCollectionTileModal } from './add-collection-tile-modal';

describe.skip('AddCollectionTileModal', () => {
  it('adds the correct class', () => {
    var renderedComponent = TestUtils.renderIntoDocument(
      <AddCollectionTileModal
        essence={null}
        timekeeper={TimekeeperMock.fixed()}
        dataCube={null}
        collection={null}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('add-collection-tile-modal');
  });

});
