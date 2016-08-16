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
import * as React from 'react';
import * as TestUtils from 'react-addons-test-utils';
import { EssenceMock, DimensionMock, StageMock } from '../../../common/models/mocks';

import { findDOMNode } from '../../utils/test-utils/index';

import { NumberFilterMenu } from './number-filter-menu';

describe('NumberFilterMenu', () => {
  var div = document.createElement('div');
  div.setAttribute("id", "Div1");

  it('adds the correct class', () => {
    var renderedComponent = TestUtils.renderIntoDocument(
      <NumberFilterMenu
        clicker={null}
        dimension={DimensionMock.time()}
        essence={EssenceMock.wikiTotals()}
        onClose={null}
        containerStage={StageMock.defaultA()}
        openOn={div}
        inside={div}

      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('number-filter-menu');
  });

});
