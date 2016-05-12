import { expect } from 'chai';
import * as sinon from 'sinon';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import '../../utils/test-utils/index';

import * as TestUtils from 'react-addons-test-utils';

import { SortOn } from '../../../common/models/index';
import { EssenceMock } from '../../../common/models/mocks';

import { $, Expression } from 'plywood';
import { PinboardMeasureTile } from './pinboard-measure-tile';

describe('PinboardMeasureTile', () => {
  it('adds the correct class', () => {

    var essence = EssenceMock.wiki();
    var sortOn = new SortOn({dimension: essence.dataSource.getDimension('articleName')});

    var renderedComponent = TestUtils.renderIntoDocument(
      <PinboardMeasureTile
        essence={essence}
        title="Pinboard"
        sortOn={sortOn}
        onSelect={null}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((ReactDOM.findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('pinboard-measure-tile');
  });

});
