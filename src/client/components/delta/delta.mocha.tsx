/*
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
import { shallow } from "enzyme";
import React from "react";
import { Delta, formatDelta } from "./delta";

const formatter = (i: number) => i.toFixed();

describe("Delta", () => {

  describe("formatDelta", () => {
    it("should handle nil values", () => {
      expect(formatDelta(null, 5)).to.equal(null);
      expect(formatDelta(undefined, 5)).to.equal(null);
      expect(formatDelta(5, undefined)).to.equal(null);
      expect(formatDelta(5, null)).to.equal(null);
    });

    it("should calculate delta attributes correctly", () => {
      expect(formatDelta(10, 5)).to.deep.equal({ delta: 5, deltaRatio: 1, deltaSign: 1 });
      expect(formatDelta(5, 10)).to.deep.equal({ delta: -5, deltaRatio: 0.5, deltaSign: -1 });
      expect(formatDelta(10, 10)).to.deep.equal({ delta: 0, deltaRatio: 0, deltaSign: 0 });
    });
  });

  describe("<Delta>", () => {
    it("should handle cases with empty values", () => {
      const emptyCurrent = shallow(<Delta currentValue={undefined} previousValue={2} formatter={formatter} />);
      const emptyPrevious = shallow(<Delta currentValue={2} previousValue={undefined} formatter={formatter} />);

      expect(emptyCurrent.find("span").hasClass("delta-neutral")).to.be.true;
      expect(emptyCurrent.find("span").contains("-")).to.be.true;

      expect(emptyPrevious.find("span").hasClass("delta-neutral")).to.be.true;
      expect(emptyPrevious.find("span").contains("-")).to.be.true;
    });

    it("should render properly positive delta", () => {
      const delta = shallow(<Delta currentValue={100} previousValue={50} formatter={formatter} />);

      const deltaNode = delta.find("span");

      expect(deltaNode.hasClass("delta-positive")).to.be.true;
      expect(deltaNode.text()).to.be.equal("▲50 (100.0%)");
    });

    it("should render properly positive delta for lower-is-better measure", () => {
      const delta = shallow(<Delta currentValue={100} previousValue={50} lowerIsBetter={true} formatter={formatter} />);

      const deltaNode = delta.find("span");

      expect(deltaNode.hasClass("delta-negative")).to.be.true;
      expect(deltaNode.text()).to.be.equal("▲50 (100.0%)");
    });

    it("should render properly negative delta", () => {
      const delta = shallow(<Delta currentValue={100} previousValue={200} formatter={formatter} />);

      const deltaNode = delta.find("span");

      expect(deltaNode.hasClass("delta-negative")).to.be.true;
      expect(deltaNode.text()).to.be.equal("▼100 (50.0%)");
    });

    it("should render properly negative delta for lower-is-better measure", () => {
      const delta = shallow(<Delta currentValue={100} previousValue={200} lowerIsBetter={true} formatter={formatter} />);

      const deltaNode = delta.find("span");

      expect(deltaNode.hasClass("delta-positive")).to.be.true;
      expect(deltaNode.text()).to.be.equal("▼100 (50.0%)");
    });

    it("should render properly neutral delta", () => {
      const delta = shallow(<Delta currentValue={100} previousValue={100} formatter={formatter} />);

      const deltaNode = delta.find("span");

      expect(deltaNode.hasClass("delta-neutral")).to.be.true;
      expect(deltaNode.text()).to.be.equal("0 (0.0%)");
    });

    it("should handle infinite cases for delta percentage", () => {
      const positive = shallow(<Delta currentValue={100} previousValue={0} formatter={formatter} />);
      const negative = shallow(<Delta currentValue={-100} previousValue={0} formatter={formatter} />);

      const positiveNode = positive.find("span");
      const negativeNode = negative.find("span");

      expect(positiveNode.hasClass("delta-positive")).to.be.true;
      expect(positiveNode.text()).to.be.equal("▲100");

      expect(negativeNode.hasClass("delta-negative")).to.be.true;
      expect(negativeNode.text()).to.be.equal("▼100");
    });

    describe("rounding for percentage", () => {
      it("should round down ratios below 0.5 decimal", () => {
        const delta = shallow(<Delta currentValue={10004} previousValue={10000} formatter={formatter} />);

        const node = delta.find("span");

        expect(node.text()).to.be.equal("▲4 (0.0%)");
      });

      it("should round up ratios above 0.5 decimal", () => {
        const delta = shallow(<Delta currentValue={10005} previousValue={10000} formatter={formatter} />);

        const node = delta.find("span");

        expect(node.text()).to.be.equal("▲5 (0.1%)");
      });
    });
  });
});
