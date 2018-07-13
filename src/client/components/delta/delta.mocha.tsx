/*
 * Copyright 2017-2018 Allegro.pl
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
import { shallow } from "enzyme";
import * as React from "react";
import { Delta } from "./delta";

const formatter = (i: number) => i.toFixed();

describe("Delta", () => {
  it("should handle cases with empty values", () => {
    const emptyCurrent = shallow(<Delta currentValue={undefined} previousValue={2} formatter={formatter}/>);
    const emptyPrevious = shallow(<Delta currentValue={2} previousValue={undefined} formatter={formatter}/>);

    expect(emptyCurrent.find("span").hasClass("delta-neutral")).to.be.true;
    expect(emptyCurrent.find("span").contains("-")).to.be.true;

    expect(emptyPrevious.find("span").hasClass("delta-neutral")).to.be.true;
    expect(emptyPrevious.find("span").contains("-")).to.be.true;
  });

  it("should render properly positive delta", () => {
    const delta = shallow(<Delta currentValue={100} previousValue={20} formatter={formatter}/>);

    const deltaNode = delta.find("span");

    expect(deltaNode.hasClass("delta-positive")).to.be.true;
    expect(deltaNode.text()).to.be.equal("▲80 (80%)");
  });

  it("should render properly negative delta", () => {
    const delta = shallow(<Delta currentValue={100} previousValue={180} formatter={formatter}/>);

    const deltaNode = delta.find("span");

    expect(deltaNode.hasClass("delta-negative")).to.be.true;
    expect(deltaNode.text()).to.be.equal("▼80 (80%)");
  });

  it("should render properly neutral delta", () => {
    const delta = shallow(<Delta currentValue={100} previousValue={100} formatter={formatter}/>);

    const deltaNode = delta.find("span");

    expect(deltaNode.hasClass("delta-neutral")).to.be.true;
    expect(deltaNode.text()).to.be.equal("0 (0%)");
  });

  it("should handle infinite cases for delta percentage", () => {
    const positive = shallow(<Delta currentValue={0} previousValue={-100} formatter={formatter}/>);
    const negative = shallow(<Delta currentValue={0} previousValue={100} formatter={formatter}/>);

    const positiveNode = positive.find("span");
    const negativeNode = negative.find("span");

    expect(positiveNode.hasClass("delta-positive")).to.be.true;
    expect(positiveNode.text()).to.be.equal("▲100");

    expect(negativeNode.hasClass("delta-negative")).to.be.true;
    expect(negativeNode.text()).to.be.equal("▼100");
  });
});
