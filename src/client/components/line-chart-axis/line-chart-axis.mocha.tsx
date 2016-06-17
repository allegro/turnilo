import { expect } from 'chai';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Timezone } from 'chronoshift';

import '../../utils/test-utils/index';

import * as TestUtils from 'react-addons-test-utils';
import { StageMock } from '../../../common/models/mocks';

import { LineChartAxis } from './line-chart-axis';

describe('LineChartAxis', () => {
  it('adds the correct class', () => {
    var scale = {
      tickFormat: () => {}
    };
    var renderedComponent = TestUtils.renderIntoDocument(
      <LineChartAxis
        scale={scale}
        stage={StageMock.defaultA()}
        ticks={[]}
        timezone={Timezone.UTC}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((ReactDOM.findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('line-chart-axis');
  });

});
