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
import { mount, shallow } from "enzyme";
import { List } from "immutable";
import * as React from "react";
import * as sinon from "sinon";
import { DimensionFixtures } from "../../../common/models/dimension/dimension.fixtures";
import { VisStrategy } from "../../../common/models/essence/essence";
import { EssenceFixtures } from "../../../common/models/essence/essence.fixtures";
import { MeasureFixtures } from "../../../common/models/measure/measure.fixtures";
import { Series } from "../../../common/models/series/series";
import { Split } from "../../../common/models/split/split";
import { Splits } from "../../../common/models/splits/splits";
import { DimensionActions } from "./dimension-actions-menu";

const onClose = () => {
};

describe("<DimensionActions>", () => {
  describe("Split Action", () => {
    it("renders enabled split action when dimension is not selected", () => {
      const actions = shallow(<DimensionActions
        triggerFilterMenu={null}
        dimension={DimensionFixtures.countryURL()}
        essence={EssenceFixtures.wikiTable()}
        onClose={onClose}
        clicker={null}
      />);

      expect(actions.find(".split").hasClass("disabled")).to.be.false;
    });

    it("renders disabled split action when dimension is selected", () => {
      const dimension = DimensionFixtures.wikiCommentLength();
      const actions = shallow(<DimensionActions
        triggerFilterMenu={null}
        dimension={dimension}
        essence={EssenceFixtures.wikiTable().changeSplits(Splits.fromDimensions(List.of(dimension.name)), VisStrategy.FairGame)}
        onClose={onClose}
        clicker={null}
      />);

      expect(actions.find(".split").hasClass("disabled")).to.be.true;
    });

    it("call clicker and onClose when dimension is not selected", () => {
      const onCloseSpy = sinon.spy();
      const changeSplitsSpy = sinon.spy();
      const clicker = { changeSplit: changeSplitsSpy };
      const dimension = DimensionFixtures.countryURL();
      const actions = mount(<DimensionActions
        triggerFilterMenu={null}
        dimension={dimension}
        essence={EssenceFixtures.wikiTable()}
        onClose={onCloseSpy}
        clicker={clicker}
      />);

      const add = actions.find(".split");
      add.simulate("click");

      expect(onCloseSpy.calledOnce).to.be.true;
      expect(changeSplitsSpy.calledOnce).to.be.true;
      expect(changeSplitsSpy.calledWith(Split.fromDimension(dimension), VisStrategy.FairGame)).to.be.true;
    });

    it("calls onClose but not clicker when dimension is selected", () => {
      const onCloseSpy = sinon.spy();
      const addSeriesSpy = sinon.spy();
      const clicker = { addSeries: addSeriesSpy };
      const dimension = DimensionFixtures.countryURL();
      const actions = mount(<DimensionActions
        triggerFilterMenu={null}
        dimension={dimension}
        essence={EssenceFixtures.wikiTable().changeSplits(Splits.fromDimensions(List.of(dimension.name)), VisStrategy.FairGame)}
        onClose={onCloseSpy}
        clicker={clicker}
      />);

      const add = actions.find(".split");
      add.simulate("click");

      expect(onCloseSpy.calledOnce).to.be.true;
      expect(addSeriesSpy.notCalled).to.be.true;
    });
  });

  describe("SubSplit Action", () => {
    it("renders enabled subsplit action when dimension is not selected", () => {
      const actions = shallow(<DimensionActions
        triggerFilterMenu={null}
        dimension={DimensionFixtures.countryURL()}
        essence={EssenceFixtures.wikiTable()}
        onClose={onClose}
        clicker={null}
      />);

      expect(actions.find(".subsplit").hasClass("disabled")).to.be.false;
    });

    it("renders disabled subsplit action when dimension is selected", () => {
      const dimension = DimensionFixtures.wikiCommentLength();
      const actions = shallow(<DimensionActions
        triggerFilterMenu={null}
        dimension={dimension}
        essence={EssenceFixtures.wikiTable()}
        onClose={onClose}
        clicker={null}
      />);

      expect(actions.find(".subsplit").hasClass("disabled")).to.be.true;
    });

    it("call clicker and onClose when dimension is not selected", () => {
      const onCloseSpy = sinon.spy();
      const addSplitSpy = sinon.spy();
      const clicker = { addSplit: addSplitSpy };
      const dimension = DimensionFixtures.countryURL();
      const actions = mount(<DimensionActions
        triggerFilterMenu={null}
        dimension={dimension}
        essence={EssenceFixtures.wikiTable()}
        onClose={onCloseSpy}
        clicker={clicker}
      />);

      const add = actions.find(".subsplit");
      add.simulate("click");

      expect(onCloseSpy.calledOnce).to.be.true;
      expect(addSplitSpy.calledOnce).to.be.true;
      expect(addSplitSpy.calledWith(Split.fromDimension(dimension), VisStrategy.FairGame)).to.be.true;
    });

    it("calls onClose but not clicker when dimension is selected", () => {
      const onCloseSpy = sinon.spy();
      const addSplitSpy = sinon.spy();
      const clicker = { addSplit: addSplitSpy };
      const dimension = DimensionFixtures.wikiCommentLength();
      const actions = mount(<DimensionActions
        triggerFilterMenu={null}
        dimension={dimension}
        essence={EssenceFixtures.wikiTable()}
        onClose={onCloseSpy}
        clicker={clicker}
      />);

      const add = actions.find(".subsplit");
      add.simulate("click");

      expect(onCloseSpy.calledOnce).to.be.true;
      expect(addSplitSpy.notCalled).to.be.true;
    });
  });

  describe("Filter Action", () => {
    it("filter action triggers passed handler", () => {
      const onCloseSpy = sinon.spy();
      const triggerSpy = sinon.spy();
      const dimension = DimensionFixtures.countryURL();
      const actions = mount(<DimensionActions
        triggerFilterMenu={triggerSpy}
        dimension={dimension}
        essence={EssenceFixtures.wikiTable()}
        onClose={onCloseSpy}
        clicker={null}
      />);

      const add = actions.find(".filter");
      add.simulate("click");

      expect(onCloseSpy.calledOnce).to.be.true;
      expect(triggerSpy.calledOnce).to.be.true;
      expect(triggerSpy.calledWith(dimension)).to.be.true;
    });
  });

  describe("Pin Action", () => {
    it("pin action calls clicker", () => {
      const onCloseSpy = sinon.spy();
      const pinSpy = sinon.spy();
      const clicker = { pin: pinSpy };
      const dimension = DimensionFixtures.countryURL();
      const actions = mount(<DimensionActions
        triggerFilterMenu={null}
        dimension={dimension}
        essence={EssenceFixtures.wikiTable()}
        onClose={onCloseSpy}
        clicker={clicker}
      />);

      const add = actions.find(".pin");
      add.simulate("click");

      expect(onCloseSpy.calledOnce).to.be.true;
      expect(pinSpy.calledOnce).to.be.true;
      expect(pinSpy.calledWith(dimension)).to.be.true;
    });
  });
});
