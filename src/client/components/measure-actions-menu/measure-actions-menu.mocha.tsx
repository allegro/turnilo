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
import * as React from "react";
import * as sinon from "sinon";
import { SinonSpy } from "sinon";
import { EssenceFixtures } from "../../../common/models/essence/essence.fixtures";
import { Measure } from "../../../common/models/measure/measure";
import { MeasureFixtures } from "../../../common/models/measure/measure.fixtures";
import { noop } from "../../../common/utils/functional/functional";
import { MeasureActions } from "./measure-actions-menu";

describe("<MeasureActions>", () => {

  const measureActions = (measure: Measure) => shallow(<MeasureActions
    series={EssenceFixtures.wikiTable().series}
    measure={measure}
    newExpression={null}
    addSeries={null}
    onClose={noop}
  />);

  describe("Add Action", () => {
    it("renders enabled add action when measure is not selected", () => {
      const actions = measureActions(MeasureFixtures.wikiUniqueUsers());

      expect(actions.find(".add-series").hasClass("disabled")).to.be.false;
    });

    it("renders disabled add action when measure is selected", () => {
      const actions = measureActions(MeasureFixtures.wikiCount());

      expect(actions.find(".add-series").hasClass("disabled")).to.be.true;
    });

    describe("click should call action", () => {

      let onCloseSpy: SinonSpy;
      let addSeriesSpy: SinonSpy;

      beforeEach(() => {
        onCloseSpy = sinon.spy();
        addSeriesSpy = sinon.spy();
      });

      const measureActions = (measure: Measure) => mount(<MeasureActions
        series={EssenceFixtures.wikiTable().series}
        measure={measure}
        onClose={onCloseSpy}
        addSeries={addSeriesSpy}
        newExpression={null} />);

      it("calls addSeries and onClose when measure is not selected", () => {
        const measure = MeasureFixtures.wikiUniqueUsers();
        const actions = measureActions(measure);

        actions.find(".add-series").simulate("click");

        expect(onCloseSpy.calledOnce).to.be.true;
        expect(addSeriesSpy.calledOnce).to.be.true;
        expect(addSeriesSpy.calledWith(measure)).to.be.true;
      });

      it("calls onClose but not addSeries when measure is selected", () => {
        const actions = measureActions(MeasureFixtures.wikiCount());

        actions.find(".add-series").simulate("click");

        expect(onCloseSpy.calledOnce).to.be.true;
        expect(addSeriesSpy.notCalled).to.be.true;
      });
    });
  });

  describe("Expression Action", () => {
    it("renders expression action", () => {
      const actions = measureActions(MeasureFixtures.wikiUniqueUsers());

      expect(actions.find(".new-expression").length).to.be.eq(1);
    });

    describe("click should call action", () => {

      let onCloseSpy: SinonSpy;
      let newExpressionSpy: SinonSpy;

      beforeEach(() => {
        onCloseSpy = sinon.spy();
        newExpressionSpy = sinon.spy();
      });

      const measureActions = (measure: Measure) => mount(<MeasureActions
        series={EssenceFixtures.wikiTable().series}
        measure={measure}
        onClose={onCloseSpy}
        addSeries={null}
        newExpression={newExpressionSpy} />);

      it("calls newExpression and onClose", () => {
        const measure = MeasureFixtures.wikiUniqueUsers();
        const actions = measureActions(measure);

        actions.find(".new-expression").simulate("click");

        expect(onCloseSpy.calledOnce).to.be.true;
        expect(newExpressionSpy.calledOnce).to.be.true;
        expect(newExpressionSpy.calledWith(measure)).to.be.true;
      });
    });
  });
});
