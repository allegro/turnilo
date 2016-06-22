import { expect } from 'chai';
import * as sinon from 'sinon';
import * as React from 'react';
import * as TestUtils from 'react-addons-test-utils';
import { $, Expression } from 'plywood';

import { DataSourceMock, EssenceMock } from '../../../common/models/mocks';

import { findDOMNode } from '../../utils/test-utils/index';

import { ImmutableInput } from './immutable-input';

describe.skip('ImmutableInput', () => {
  it('adds the correct class', () => {
    var myImmutableInstance: any;

    var renderedComponent = TestUtils.renderIntoDocument(
      <ImmutableInput
        instance={myImmutableInstance}
        path={'pouet'}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('immutable-input');
  });

});
