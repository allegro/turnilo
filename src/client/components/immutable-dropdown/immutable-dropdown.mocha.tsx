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

import { DataCubeMock } from '../../../common/models/mocks';
import { DataCube, ListItem, Cluster } from '../../../common/models/index';

import { findDOMNode } from '../../utils/test-utils/index';

import { ImmutableDropdown } from './immutable-dropdown';

describe('ImmutableDropdown', () => {
  var component: any;
  var node: any;
  var onChange: any;

  beforeEach(() => {

    onChange = sinon.spy();

    var MyDropdown = ImmutableDropdown.specialize<ListItem>();

    const clusterNames = Cluster.TYPE_VALUES.map(type => {return {value: type, label: type}; });

    component = TestUtils.renderIntoDocument(
      <MyDropdown
        instance={DataCubeMock.twitter()}
        path={'clusterName'}
        label="Cluster"

        onChange={onChange}

        items={clusterNames}

        equal={(a: ListItem, b: ListItem) => a.value === b.value}
        renderItem={(a: ListItem) => a.label}
        keyItem={(a: ListItem) => a.value}
      />
    );

    node = findDOMNode(component) as any;
  });

  it('adds the correct class', () => {
    expect(TestUtils.isCompositeComponent(component), 'should be composite').to.equal(true);
    expect(node.className, 'should contain class').to.contain('immutable-dropdown');
  });


  it('selects an item and calls onChange', () => {
    expect(onChange.callCount).to.equal(0);

    TestUtils.Simulate.click(node);

    var items = TestUtils.scryRenderedDOMComponentsWithClass(component, 'dropdown-item');

    TestUtils.Simulate.click(items[1]);

    expect(onChange.callCount).to.equal(1);

    const args = onChange.args[0];

    expect(args[0]).to.be.instanceOf(DataCube);
    expect(args[0].clusterName).to.equal(Cluster.TYPE_VALUES[1]);

    expect(args[1]).to.equal(true);

    expect(args[2]).to.equal('clusterName');
  });

});
