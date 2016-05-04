import { expect } from 'chai';
import * as sinon from 'sinon';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-addons-test-utils';

import '../../utils/test-utils/index';

import { $, Expression, PlywoodValue } from 'plywood';
import { BucketMarks } from './bucket-marks';

import { StageMock } from '../../../common/models/mocks';

describe('BucketMarks', () => {
  it('adds the correct class', () => {
    var renderedComponent = TestUtils.renderIntoDocument(
      <BucketMarks
        stage={StageMock.defaultA()}
        ticks={[]}
        scale={null}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((ReactDOM.findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('bucket-marks');
  });

});
