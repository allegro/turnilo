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
import React from "react";
import * as sinon from "sinon";
import { SinonSpy } from "sinon";
import { EssenceFixtures } from "../../../common/models/essence/essence.fixtures";
import { Measure } from "../../../common/models/measure/measure";
import { MeasureFixtures } from "../../../common/models/measure/measure.fixtures";
import { MeasureSeries } from "../../../common/models/series/measure-series";
import { noop } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { AddMeasureSeriesButton } from "./add-measure-series";

const renderButton = (measure: Measure) => shallow(<AddMeasureSeriesButton
  series={EssenceFixtures.wikiTable().series}
  measure={measure}
  addSeries={null}
  onClose={noop}
/>);

const mountButton = (measure: Measure, addSeries: Fn, onClose: Fn) => mount(<AddMeasureSeriesButton
  series={EssenceFixtures.wikiTable().series}
  measure={measure}
  onClose={onClose}
  addSeries={addSeries} />)
  .find(".add-series");

describe("Add Measure Series Button", () => {

  it("renders enabled add action when measure is not selected", () => {
    const actions = renderButton(MeasureFixtures.wikiUniqueUsers());

    expect(actions.find(".add-series").hasClass("disabled")).to.be.false;
  });

  it("renders disabled add action when measure is selected", () => {
    const actions = renderButton(MeasureFixtures.count());

    expect(actions.find(".add-series").hasClass("disabled")).to.be.true;
  });

  describe("click action", () => {

    describe("when measure is not selected", () => {
      let onCloseSpy: SinonSpy;
      let addSeriesSpy: SinonSpy;
      let measure: Measure;

      beforeEach(() => {
        onCloseSpy = sinon.spy();
        addSeriesSpy = sinon.spy();
        measure = MeasureFixtures.wikiUniqueUsers();
        const addButton = mountButton(measure, addSeriesSpy, onCloseSpy);
        addButton.simulate("click");
      });

      it("calls addSeries", () => {
        expect(addSeriesSpy.calledOnce).to.be.true;
        const argument = addSeriesSpy.args[0][0];
        expect(argument.equals(MeasureSeries.fromMeasure(measure))).to.be.true;
      });

      it("calls onClose", () => {
        expect(onCloseSpy.calledOnce).to.be.true;
      });
    });

    describe("when measure is selected", () => {
      let onCloseSpy: SinonSpy;
      let addSeriesSpy: SinonSpy;

      beforeEach(() => {
        onCloseSpy = sinon.spy();
        addSeriesSpy = sinon.spy();
        const measure = MeasureFixtures.count();
        const addButton = mountButton(measure, addSeriesSpy, onCloseSpy);
        addButton.simulate("click");
      });

      it("should not call addSeries", () => {
        expect(addSeriesSpy.called).to.be.false;
      });

      it("calls onClose", () => {
        expect(onCloseSpy.calledOnce).to.be.true;
      });
    });
  });
});
