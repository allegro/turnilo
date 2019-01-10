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
import { MeasureSeriesDefinition } from "../../../common/models/series/series-definition";
import { MeasureActions } from "./measure-actions-menu";

const onCloseNoop = () => {
};

describe("<MeasureActions>", () => {

  const measureActions = (measure: Measure) => shallow(<MeasureActions
    essence={EssenceFixtures.wikiTable()}
    measure={measure}
    promptSeries={null}
    appendSeries={null}
    onClose={onCloseNoop}
  />);

  describe("Add Action", () => {
    it("renders enabled add action when measure is not selected", () => {
      const actions = measureActions(MeasureFixtures.wikiUniqueUsers());

      expect(actions.find(".add").hasClass("disabled")).to.be.false;
    });

    it("renders disabled add action when measure is selected", () => {
      const actions = measureActions(MeasureFixtures.wikiCount());

      expect(actions.find(".add").hasClass("disabled")).to.be.true;
    });

    describe("click should call action", () => {

      let onCloseSpy: SinonSpy;
      let addSeriesSpy: SinonSpy;

      beforeEach(() => {
        onCloseSpy = sinon.spy();
        addSeriesSpy = sinon.spy();
      });

      const measureActions = (measure: Measure) => mount(<MeasureActions
        essence={EssenceFixtures.wikiTable()}
        measure={measure}
        promptSeries={null}
        appendSeries={addSeriesSpy}
        onClose={onCloseSpy}
      />);

      it("calls clicker.addSeries and onClose when measure is not selected", () => {
        const measure = MeasureFixtures.wikiUniqueUsers();
        const actions = measureActions(measure);

        actions.find(".add").simulate("click");

        expect(onCloseSpy.calledOnce).to.be.true;
        expect(addSeriesSpy.calledOnce).to.be.true;
        expect(addSeriesSpy.calledWith(MeasureSeriesDefinition.fromMeasure(measure))).to.be.true;
      });

      it("calls onClose but not clicker.addSeries when measure is selected", () => {
        const actions = measureActions(MeasureFixtures.wikiCount());

        actions.find(".add").simulate("click");

        expect(onCloseSpy.calledOnce).to.be.true;
        expect(addSeriesSpy.notCalled).to.be.true;
      });
    });
  });
});
