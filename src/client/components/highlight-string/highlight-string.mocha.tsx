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
import * as ReactDOM from 'react-dom/server';
import * as TestUtils from 'react-addons-test-utils';

import '../../utils/test-utils/index';

import { $, Expression } from 'plywood';
import { HighlightString } from './highlight-string';

describe('HighlightString', () => {
  it('properly highlights different types', () => {
    expect(ReactDOM.renderToStaticMarkup(
      <HighlightString
        highlight={/[0-9]*/}
        text="2me2"
      />
    )).to.equal(`<span class="highlight-string"><span class="pre"></span><span class="bold">2</span><span class="post">me2</span></span>`);

    expect(ReactDOM.renderToStaticMarkup(
      <HighlightString
        highlight="me"
        text="2me2"
      />
    )).to.equal(`<span class="highlight-string"><span class="pre">2</span><span class="bold">me</span><span class="post">2</span></span>`);
    // expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    // expect((ReactDOM.findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('highlight-string');
  });

});
