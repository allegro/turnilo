import { expect } from 'chai';
import * as sinon from 'sinon';
import '../../utils/jsdom-setup';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../../utils/require-extensions';

import * as TestUtils from 'react-addons-test-utils';

import { DragPosition } from '../../../common/models/index';
import { FancyDragIndicator } from './fancy-drag-indicator';

describe('FancyDragIndicator', () => {
  var dragPosition = DragPosition.fromJS({
    insert: 0
  });

  it('adds the correct class', () => {
    var renderedComponent = TestUtils.renderIntoDocument(
      <FancyDragIndicator
        dragPosition={dragPosition}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((ReactDOM.findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('fancy-drag-indicator');
  });

});
