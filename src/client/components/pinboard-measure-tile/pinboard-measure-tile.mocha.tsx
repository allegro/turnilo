/*
 * Copyright 2015-2016 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

    var essence = EssenceMock.wikiTotals();
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
