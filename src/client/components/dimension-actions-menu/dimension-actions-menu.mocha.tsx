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
import { mount, shallow } from "enzyme";
import { List } from "immutable";
import * as React from "react";
import * as sinon from "sinon";
import { SinonSpy } from "sinon";
import { Dimension } from "../../../common/models/dimension/dimension";
import { DimensionFixtures } from "../../../common/models/dimension/dimension.fixtures";
import { Essence, VisStrategy } from "../../../common/models/essence/essence";
import { EssenceFixtures } from "../../../common/models/essence/essence.fixtures";
import { Split } from "../../../common/models/split/split";
import { Splits } from "../../../common/models/splits/splits";
import { noop } from "../../../common/utils/functional/functional";
import { DimensionActions } from "./dimension-actions-menu";

const onClose = noop;

describe("<DimensionActions>", () => {
  describe("Split Action", () => {

    const dimActions = (dimension: Dimension, essence: Essence) => shallow(<DimensionActions
      triggerFilterMenu={null}
      dimension={dimension}
      essence={essence}
      onClose={onClose}
      clicker={null}
    />);

    it("renders enabled action when dimension is not selected", () => {
      const actions = dimActions(DimensionFixtures.countryURL(), EssenceFixtures.wikiTable());

      expect(actions.find(".split").hasClass("disabled")).to.equal(false);
    });

    it("renders enabled action when dimension is selected but is not only one split", () => {
      const actions = dimActions(DimensionFixtures.wikiCommentLength(), EssenceFixtures.wikiTable());

      expect(actions.find(".split").hasClass("disabled")).to.equal(false);
    });

    it("renders disabled action when dimension is only selected split", () => {
      const dimension = DimensionFixtures.wikiCommentLength();
      const essenceWithOneSplit = EssenceFixtures.wikiTable().changeSplits(Splits.fromDimensions(List.of(dimension)), VisStrategy.FairGame);

      const actions = dimActions(dimension, essenceWithOneSplit);

      expect(actions.find(".split").hasClass("disabled")).to.equal(true);
    });

    describe("click should call action", () => {

      let onCloseSpy: SinonSpy;
      let changeSplitSpy: SinonSpy;

      beforeEach(() => {
        onCloseSpy = sinon.spy();
        changeSplitSpy = sinon.spy();
      });

      const dimActions = (dimension: Dimension, essence: Essence) => mount(<DimensionActions
        clicker={{ changeSplit: changeSplitSpy }}
        essence={essence}
        dimension={dimension}
        onClose={onCloseSpy}
        triggerFilterMenu={null} />);

      it("call clicker.changeSplit and onClose when dimension is not selected", () => {
        const dimension = DimensionFixtures.countryURL();
        const actions = dimActions(dimension, EssenceFixtures.wikiTable());

        actions.find(".split").simulate("click");

        expect(onCloseSpy.calledOnce).to.equal(true);
        expect(changeSplitSpy.calledOnce).to.equal(true);
        expect(changeSplitSpy.calledWith(Split.fromDimension(dimension), VisStrategy.FairGame)).to.equal(true);
      });

      it("calls onClose but not clicker.changeSplit when dimension is selected", () => {
        const dimension = DimensionFixtures.countryURL();
        const essenceWithOneSplit = EssenceFixtures.wikiTable().changeSplits(Splits.fromDimensions(List.of(dimension)), VisStrategy.FairGame);
        const actions = dimActions(dimension, essenceWithOneSplit);

        actions.find(".split").simulate("click");

        expect(onCloseSpy.calledOnce).to.equal(true);
        expect(changeSplitSpy.notCalled).to.equal(true);
      });
    });
  });

  describe("SubSplit Action", () => {

    const dimActions = (dimension: Dimension) => shallow(<DimensionActions
      triggerFilterMenu={null}
      dimension={dimension}
      essence={EssenceFixtures.wikiTable()}
      onClose={onClose}
      clicker={null}
    />);

    it("renders enabled action when dimension is not selected", () => {
      const actions = dimActions(DimensionFixtures.countryURL());

      expect(actions.find(".subsplit").hasClass("disabled")).to.equal(false);
    });

    it("renders disabled action when dimension is only selected split", () => {
      const actions = dimActions(DimensionFixtures.wikiCommentLength());

      expect(actions.find(".subsplit").hasClass("disabled")).to.equal(true);
    });

    describe("click should call action", () => {

      let onCloseSpy: SinonSpy;
      let addSplitSpy: SinonSpy;

      beforeEach(() => {
        onCloseSpy = sinon.spy();
        addSplitSpy = sinon.spy();
      });

      const dimActions = (dimension: Dimension) => mount(<DimensionActions
        clicker={{ addSplit: addSplitSpy }}
        essence={EssenceFixtures.wikiTable()}
        dimension={dimension}
        onClose={onCloseSpy}
        triggerFilterMenu={null} />);

      it("call clicker.changeSplit and onClose when dimension is not selected", () => {
        const dimension = DimensionFixtures.countryURL();
        const actions = dimActions(dimension);

        actions.find(".subsplit").simulate("click");

        expect(onCloseSpy.calledOnce).to.equal(true);
        expect(addSplitSpy.calledOnce).to.equal(true);
        expect(addSplitSpy.calledWith(Split.fromDimension(dimension), VisStrategy.FairGame)).to.equal(true);
      });

      it("calls onClose but not clicker.changeSplit when dimension is selected", () => {
        const dimension = DimensionFixtures.wikiCommentLength();
        const actions = dimActions(dimension);

        actions.find(".subsplit").simulate("click");

        expect(onCloseSpy.calledOnce).to.equal(true);
        expect(addSplitSpy.notCalled).to.equal(true);
      });
    });
  });

  describe("Filter Action", () => {
    it("clicking filter action triggers passed handler", () => {
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

      actions.find(".filter").simulate("click");

      expect(onCloseSpy.calledOnce).to.equal(true);
      expect(triggerSpy.calledOnce).to.equal(true);
      expect(triggerSpy.calledWith(dimension)).to.equal(true);
    });
  });

  describe("Pin Action", () => {
    it("clicking pin action calls clicker", () => {
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

      actions.find(".pin").simulate("click");

      expect(onCloseSpy.calledOnce).to.equal(true);
      expect(pinSpy.calledOnce).to.equal(true);
      expect(pinSpy.calledWith(dimension)).to.equal(true);
    });
  });
});
