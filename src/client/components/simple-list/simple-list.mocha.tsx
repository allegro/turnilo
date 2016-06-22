import { expect } from 'chai';
import * as sinon from 'sinon';
import * as React from 'react';
import * as TestUtils from 'react-addons-test-utils';
import { $, Expression } from 'plywood';

import { DataSourceMock, EssenceMock } from '../../../common/models/mocks';

import { findDOMNode } from '../../utils/test-utils/index';

import { SimpleList } from './simple-list';

describe.skip('SimpleList', () => {
  it('adds the correct class', () => {
    var myRows: any[] = [];

    var renderedComponent = TestUtils.renderIntoDocument(
      <SimpleList
        rows={myRows}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('simple-list');
  });

});
