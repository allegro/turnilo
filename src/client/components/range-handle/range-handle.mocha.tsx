import { expect } from 'chai';

import * as React from 'react';
import * as TestUtils from 'react-addons-test-utils';
import { findDOMNode } from '../../utils/test-utils/index';

import { RangeHandle } from './range-handle';

describe('RangeHandle', () => {
  it('adds the correct class', () => {

    var renderedComponent = TestUtils.renderIntoDocument(
      <RangeHandle
        positionLeft={20}
        onChange={() => {}}
        isAny={false}
        offset={600}

      />
    );
    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('range-handle');
  });
});
