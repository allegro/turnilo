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
import * as TestUtils from 'react-addons-test-utils';
import { $, Expression } from 'plywood';

import { DataSource } from '../../../common/models/index';
import { DataSourceMock } from '../../../common/models/mocks';

import { findDOMNode } from '../../utils/test-utils/index';

import { ImmutableInput } from './immutable-input';

describe('ImmutableInput', () => {
  var component: any;
  var node: any;
  var onChange: any;
  var onInvalid: any;

  beforeEach(() => {
    onChange = sinon.spy();
    onInvalid = sinon.spy();

    component = TestUtils.renderIntoDocument(
      <ImmutableInput
        instance={DataSourceMock.twitter()}
        path={'engine'}
        validator={/^[a-z]+$/}
        onChange={onChange}
        onInvalid={onInvalid}
      />
    );

    node = findDOMNode(component) as any;
  });

  it('adds the correct class', () => {
    expect(TestUtils.isCompositeComponent(component), 'should be composite').to.equal(true);
    expect(node.className, 'should contain class').to.contain('immutable-input');
  });

  it('works for valid values', () => {
    node.value = 'giraffe'; // Giraffes are the best engines
    TestUtils.Simulate.change(node);

    expect(onInvalid.callCount).to.equal(0);

    expect(onChange.callCount).to.equal(1);
    const args = onChange.args[0];

    expect(args[0]).to.be.instanceOf(DataSource);
    expect(args[0].engine).to.equal('giraffe');

    expect(args[1]).to.equal(true);

    expect(args[2]).to.equal('engine');
  });

  it('works for invalid values', () => {
    node.value = '123';
    TestUtils.Simulate.change(node);

    expect(onInvalid.callCount).to.equal(1);
    expect(onInvalid.args[0][0]).to.equal('123');

    expect(onChange.callCount).to.equal(1);
    const args = onChange.args[0];

    expect(args[0]).to.be.instanceOf(DataSource);
    expect(args[0].engine).to.equal(DataSourceMock.twitter().engine);

    expect(args[1]).to.equal(false);

    expect(args[2]).to.equal('engine');

    expect(node.value).to.equal('123');
  });
});
