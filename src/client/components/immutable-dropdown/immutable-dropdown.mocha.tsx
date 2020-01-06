/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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

import { expect } from "chai";
import * as React from "react";
import * as TestUtils from "react-dom/test-utils";
import * as sinon from "sinon";
import { DataCube } from "../../../common/models/data-cube/data-cube";
import { DataCubeFixtures } from "../../../common/models/data-cube/data-cube.fixtures";
import { ListItem } from "../../../common/models/list-item/list-item";

import { findDOMNode, renderIntoDocument } from "../../utils/test-utils";

import { ImmutableDropdown } from "./immutable-dropdown";

const ITEMS = [{ value: "value1", label: "label1" }, { value: "value2", label: "label2" }];

describe("ImmutableDropdown", () => {
  let component: any;
  let node: any;
  let onChange: any;

  beforeEach(() => {

    onChange = sinon.spy();

    component = renderIntoDocument(
      <ImmutableDropdown<ListItem>
        instance={DataCubeFixtures.twitter()}
        path={"clusterName"}
        label="Cluster"

        onChange={onChange}

        items={ITEMS}

        equal={(a: ListItem, b: ListItem) => a.value === b.value}
        renderItem={(a: ListItem) => a.label}
        keyItem={(a: ListItem) => a.value}
      />
    );

    node = findDOMNode(component) as any;
  });

  it("adds the correct class", () => {
    expect(TestUtils.isCompositeComponent(component), "should be composite").to.equal(true);
    expect(node.className, "should contain class").to.contain("immutable-dropdown");
  });

  it("selects an item and calls onChange", () => {
    expect(onChange.callCount).to.equal(0);

    TestUtils.Simulate.click(node);

    const items = TestUtils.scryRenderedDOMComponentsWithClass(component, "dropdown-item");

    TestUtils.Simulate.click(items[1]);

    expect(onChange.callCount).to.equal(1);

    const args = onChange.args[0];

    expect(args[0]).to.be.instanceOf(DataCube);
    expect(args[0].clusterName).to.equal(ITEMS[1].value);

    expect(args[1]).to.equal(true);

    expect(args[2]).to.equal("clusterName");
  });

});
