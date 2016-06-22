import { expect } from 'chai';
import * as sinon from 'sinon';
import * as React from 'react';
import * as TestUtils from 'react-addons-test-utils';
import { $, Expression } from 'plywood';

import { DataSourceMock, EssenceMock } from '../../../common/models/mocks';

import { findDOMNode } from '../../utils/test-utils/index';

import { FormLabel } from './form-label';

describe('FormLabel', () => {
  it('adds the correct class', () => {
    var renderedComponent = TestUtils.renderIntoDocument(
      <FormLabel

      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('form-label');
  });

});
