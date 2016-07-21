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

import { DataCube } from '../../../common/models/index';
import { DataCubeMock } from '../../../common/models/mocks';

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
        instance={DataCubeMock.twitter()}
        path={'clusterName'}
        validator={/^.+$/}
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
    node.value = 'giraffe';
    TestUtils.Simulate.change(node);

    expect(onInvalid.callCount).to.equal(0);

    expect(onChange.callCount).to.equal(1);
    const args = onChange.args[0];

    expect(args[0]).to.be.instanceOf(DataCube);
    expect(args[0].clusterName).to.equal('giraffe');

    expect(args[1]).to.equal(true);

    expect(args[2]).to.equal('clusterName');
  });

  it('works for invalid values', () => {
    node.value = '';
    TestUtils.Simulate.change(node);

    expect(onInvalid.callCount).to.equal(1);
    expect(onInvalid.args[0][0]).to.equal('');

    expect(onChange.callCount).to.equal(1);
    var args = onChange.args[0];

    expect(args[0]).to.be.instanceOf(DataCube);
    expect(args[0].clusterName).to.equal(DataCubeMock.twitter().clusterName);

    expect(args[1]).to.equal(false);

    expect(args[2]).to.equal('clusterName');

    expect(node.value).to.equal('');


    // Back to valid value

    node.value = 'pouet';
    TestUtils.Simulate.change(node);

    expect(onInvalid.callCount).to.equal(1);

    expect(onChange.callCount).to.equal(2);
    args = onChange.args[1];

    expect(args[0]).to.be.instanceOf(DataCube);
    expect(args[0].clusterName).to.equal('pouet');

    expect(args[1]).to.equal(true);

    expect(args[2]).to.equal('clusterName');

    expect(node.value).to.equal('pouet');
  });

  describe('with stringToValue/valueToString', () => {
    beforeEach(() => {
      let stringToValue = (str: string) => str.toLowerCase();
      let valueToString = (str: string) => str.toUpperCase();

      component = TestUtils.renderIntoDocument(
        <ImmutableInput
          instance={DataCubeMock.twitter()}
          path={'clusterName'}
          validator={/^.+$/}
          onChange={onChange}
          onInvalid={onInvalid}
          stringToValue={stringToValue}
          valueToString={valueToString}
        />
      );

      node = findDOMNode(component) as any;
    });

    it('works for valid values', () => {
      expect(node.value).to.equal('DRUID');

      node.value = 'GIRAFFE';
      TestUtils.Simulate.change(node);

      expect(onInvalid.callCount).to.equal(0);

      expect(onChange.callCount).to.equal(1);
      const args = onChange.args[0];

      expect(args[0]).to.be.instanceOf(DataCube);
      expect(args[0].clusterName).to.equal('giraffe');

      expect(args[1]).to.equal(true);

      expect(args[2]).to.equal('clusterName');
    });
  });
});
