import { expect } from 'chai';
import * as sinon from 'sinon';
import '../../utils/jsdom-setup';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../../utils/require-extensions';
import { mockRequireEnsure, mockReactComponent } from '../../utils/test-utils/index';

import * as TestUtils from 'react-addons-test-utils';

import { DataSourceMock } from '../../../common/models/mocks';

import { $, Expression } from 'plywood';

import { WallTime } from 'chronoshift';
var tzData = require('../../../../node_modules/chronoshift/lib/walltime/walltime-data.js');
WallTime.init(tzData.rules, tzData.zones);

import { DimensionMeasurePanel } from '../dimension-measure-panel/dimension-measure-panel';
import { FilterTile } from '../filter-tile/filter-tile';
import { SplitTile } from '../split-tile/split-tile';


describe('CubeView', () => {
  before(() => {
    mockReactComponent(DimensionMeasurePanel);
    mockReactComponent(FilterTile);
    mockReactComponent(SplitTile);
  });

  after(() => {
    (DimensionMeasurePanel as any).restore();
    (FilterTile as any).restore();
    (SplitTile as any).restore();
  });

  var { CubeView } = mockRequireEnsure('./cube-view');

  it('adds the correct class', () => {
    var updateViewHash = sinon.stub();

    var renderedComponent = TestUtils.renderIntoDocument(
      <CubeView
        hash={null}
        dataSource={DataSourceMock.wiki()}
        updateViewHash={updateViewHash}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((ReactDOM.findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('cube-view');

  });
});


