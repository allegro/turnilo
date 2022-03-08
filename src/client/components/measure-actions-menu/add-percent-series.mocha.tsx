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
import { SinonSpy, spy } from "sinon";
import { EssenceFixtures } from "../../../common/models/essence/essence.fixtures";
import { ExpressionSeriesOperation } from "../../../common/models/expression/expression";
import { PercentExpression, PercentOperation } from "../../../common/models/expression/percent";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { ExpressionSeries } from "../../../common/models/series/expression-series";
import { PERCENT_FORMAT } from "../../../common/models/series/series-format";
import { Fn } from "../../../common/utils/general/general";
import { AddPercentSeriesButton } from "./add-percent-series";

const essence = EssenceFixtures.wikiTable();
const series = essence.series;
const firstMeasure = essence.getConcreteSeries().first().measure;

const constructPercentSeries = (operation: PercentOperation) =>
  new ExpressionSeries({ reference: firstMeasure.name, format: PERCENT_FORMAT, expression: new PercentExpression({ operation }) });

const seriesWithPercents = (...percents: PercentOperation[]): SeriesList =>
  percents.reduce((e, operation) =>
      e.addSeries(constructPercentSeries(operation)),
    essence).series;

const renderButton = (series: SeriesList) => shallow(<AddPercentSeriesButton
  addSeries={null}
  series={series}
  measure={firstMeasure}
  onClose={null} />);

const mountButton = (series: SeriesList, addSeries: Fn, onClose: Fn) =>
  mount(<AddPercentSeriesButton
    addSeries={addSeries}
    series={series}
    measure={firstMeasure}
    onClose={onClose} />)
    .find(".new-percent-expression");

describe("Add Percent Series Button", () => {
  it("button is enabled when no percents already selected", () => {
    const btn = renderButton(series);

    expect(btn.hasClass("disabled")).to.be.false;
  });

  it("button is enabled when only one percent already selected", () => {
    const btn = renderButton(seriesWithPercents(ExpressionSeriesOperation.PERCENT_OF_PARENT));

    expect(btn.hasClass("disabled")).to.be.false;
  });

  it("button is disabled when both percents already selected", () => {
    const series = seriesWithPercents(ExpressionSeriesOperation.PERCENT_OF_PARENT, ExpressionSeriesOperation.PERCENT_OF_TOTAL);
    const btn = renderButton(series);

    expect(btn.hasClass("disabled")).to.be.true;
  });

  describe("click action", () => {

    describe("with no percents already selected", () => {
      let onCloseSpy: SinonSpy;
      let addSeriesSpy: SinonSpy;

      beforeEach(() => {
        onCloseSpy = spy();
        addSeriesSpy = spy();
        const addButton = mountButton(series, addSeriesSpy, onCloseSpy);
        addButton.simulate("click");
      });

      it("calls addSeries with '% of Parent'", () => {
        expect(addSeriesSpy.calledOnce).to.be.true;
        const argument = addSeriesSpy.args[0][0];
        expect(argument.equals(constructPercentSeries(ExpressionSeriesOperation.PERCENT_OF_PARENT))).to.be.true;
      });

      it("should call onClose", () => {
        expect(onCloseSpy.calledOnce).to.be.true;
      });
    });

    describe("with parent percent already selected", () => {
      let onCloseSpy: SinonSpy;
      let addSeriesSpy: SinonSpy;

      beforeEach(() => {
        onCloseSpy = spy();
        addSeriesSpy = spy();
        const addButton = mountButton(seriesWithPercents(ExpressionSeriesOperation.PERCENT_OF_PARENT), addSeriesSpy, onCloseSpy);
        addButton.simulate("click");
      });

      it("calls addSeries with '% of Total'", () => {
        expect(addSeriesSpy.calledOnce).to.be.true;
        const argument = addSeriesSpy.args[0][0];
        expect(argument.equals(constructPercentSeries(ExpressionSeriesOperation.PERCENT_OF_TOTAL))).to.be.true;
      });

      it("should call onClose", () => {
        expect(onCloseSpy.calledOnce).to.be.true;
      });
    });

    describe("with both percents already selected", () => {
      let onCloseSpy: SinonSpy;
      let addSeriesSpy: SinonSpy;

      beforeEach(() => {
        onCloseSpy = spy();
        addSeriesSpy = spy();
        const addButton = mountButton(seriesWithPercents(ExpressionSeriesOperation.PERCENT_OF_PARENT, ExpressionSeriesOperation.PERCENT_OF_TOTAL), addSeriesSpy, onCloseSpy);
        addButton.simulate("click");
      });

      it("should not call addSeries", () => {
        expect(addSeriesSpy.called).to.be.false;
      });

      it("should call onClose", () => {
        expect(onCloseSpy.calledOnce).to.be.true;
      });
    });
  });
});
