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
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-addons-test-utils';

import '../../utils/test-utils/index';

import { EssenceMock, DimensionMock, StageMock } from '../../../common/models/mocks';
import { StringFilterMenu } from './string-filter-menu';

describe.skip('StringFilterMenu', () => {
  it('adds the correct class', () => {
    var div = document.createElement('div');
    div.setAttribute("id", "Div1");

    var renderedComponent = TestUtils.renderIntoDocument(
      <StringFilterMenu
        clicker={null}
        dimension={DimensionMock.countryURL()}
        essence={EssenceMock.wikiLineChart()}
        onClose={null}
        containerStage={StageMock.defaultA()}
        openOn={div}
        inside={div}
        changePosition={null}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((ReactDOM.findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('string-filter-menu');
  });

});
