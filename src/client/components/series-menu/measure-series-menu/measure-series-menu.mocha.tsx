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
import { mount } from "enzyme";
import * as React from "react";
import * as sinon from "sinon";
import { SinonSpy } from "sinon";
import { EssenceFixtures } from "../../../../common/models/essence/essence.fixtures";
import { Measure } from "../../../../common/models/measure/measure";
import { MeasureFixtures } from "../../../../common/models/measure/measure.fixtures";
import { MeasureSeriesDefinition, SeriesDefinition } from "../../../../common/models/series/series-definition";
import { DEFAULT_FORMAT, PERCENT_FORMAT } from "../../../../common/models/series/series-format";
import { SeriesFixtures } from "../../../../common/models/series/series.fixtures";
import { StageFixtures } from "../../../../common/models/stage/stage.fixtures";
import { Unary } from "../../../../common/utils/functional/functional";
import { Fn } from "../../../../common/utils/general/general";
import { MeasureSeriesMenu } from "./measure-series-menu";

const openOn = document.createElement("div");

interface MenuProps {
  onSave?: Unary<SeriesDefinition, void>;
  onClose?: Fn;
  measure?: Measure;
}

const mountMenu = ({ onSave = null, onClose = null, measure = MeasureFixtures.wikiCount() }: MenuProps = {}) => mount(<MeasureSeriesMenu
  onSave={onSave}
  measure={measure}
  openOn={openOn}
  containerStage={StageFixtures.defaultA()}
  onClose={onClose}
  series={SeriesFixtures.wikiCount()} />);

describe("<MeasureSeriesMenu>", () => {
  let onCloseSpy: SinonSpy;
  let onSaveSpy: SinonSpy;

  beforeEach(() => {
    onCloseSpy = sinon.spy();
    onSaveSpy = sinon.spy();
  });

  describe("ok click", () => {
    it("should pass to clicker changed series", () => {
      const menu = mountMenu({ onSave: onSaveSpy, onClose: onCloseSpy });

      (menu.instance() as MeasureSeriesMenu).saveFormat(PERCENT_FORMAT);
      menu.update();

      const ok = menu.find("Button[className='ok']");
      ok.simulate("click");

      expect(onCloseSpy.calledOnce).to.be.true;
      expect(onSaveSpy.calledOnce).to.be.true;

      const series = EssenceFixtures.wikiTable().series;
      const count: MeasureSeriesDefinition = series.getMeasureSeries(SeriesFixtures.wikiCount().reference) as MeasureSeriesDefinition;

      const newCount = count
        .set("format", PERCENT_FORMAT);

      const changedSeries = EssenceFixtures.wikiTable().series.replaceSeries(count, newCount);

      expect(onSaveSpy.firstCall.calledWith(changedSeries)).to.be.true;
    });
  });

  describe("validation", () => {
    it("ok should be enable after format change", () => {
      const menu = mountMenu();
      const ok = menu.find("Button[className='ok']");

      expect(ok.prop("disabled")).to.be.true;

      (menu.instance() as MeasureSeriesMenu).saveFormat(PERCENT_FORMAT);
      menu.update();

      const okAfterChange = menu.find("Button[className='ok']");
      expect(okAfterChange.prop("disabled")).to.be.false;
    });

    it("ok should stay disabled after series revert", () => {
      const menu = mountMenu();
      const ok = menu.find("Button[className='ok']");

      expect(ok.prop("disabled")).to.be.true;

      (menu.instance() as MeasureSeriesMenu).saveFormat(PERCENT_FORMAT);
      menu.update();

      const okAfterChange = menu.find("Button[className='ok']");
      expect(okAfterChange.prop("disabled")).to.be.false;

      (menu.instance() as MeasureSeriesMenu).saveFormat(DEFAULT_FORMAT);
      menu.update();

      const okAfterRevert = menu.find("Button[className='ok']");
      expect(okAfterRevert.prop("disabled")).to.be.true;
    });
  });
});
