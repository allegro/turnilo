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
import { Clicker } from "../../../common/models/clicker/clicker";
import { Essence } from "../../../common/models/essence/essence";
import { EssenceFixtures } from "../../../common/models/essence/essence.fixtures";
import { DEFAULT_FORMAT, PERCENT_FORMAT, SeriesDefinition, SeriesPercentages } from "../../../common/models/series/series-definition";
import { SeriesFixtures } from "../../../common/models/series/series.fixtures";
import { StageFixtures } from "../../../common/models/stage/stage.fixtures";
import { Fn } from "../../../common/utils/general/general";
import { PercentagePicker } from "./percent-picker";
import { SeriesMenu } from "./series-menu";

const openOn = document.createElement("div");

interface MenuProps {
  clicker?: Clicker;
  onClose?: Fn;
  essence?: Essence;
}

const mountMenu = ({ clicker = null, onClose = null, essence = EssenceFixtures.wikiTable() }: MenuProps = {}) => mount(<SeriesMenu
  clicker={clicker}
  essence={essence}
  openOn={openOn}
  containerStage={StageFixtures.defaultA()}
  onClose={onClose}
  series={SeriesFixtures.wikiCount()} />);

describe("<SeriesMenu>", () => {
  let onCloseSpy: SinonSpy;
  let changeSeriesListSpy: SinonSpy;

  beforeEach(() => {
    onCloseSpy = sinon.spy();
    changeSeriesListSpy = sinon.spy();
  });

  describe("ok click", () => {
    it("should pass to clicker changed series", () => {
      const clicker = { changeSeriesList: changeSeriesListSpy };
      const menu = mountMenu({ clicker, onClose: onCloseSpy });

      (menu.instance() as SeriesMenu).saveFormat(PERCENT_FORMAT);
      (menu.instance() as SeriesMenu).savePercentages(new SeriesPercentages({ ofTotal: true }));
      menu.update();

      const ok = menu.find("Button[className='ok']");
      ok.simulate("click");

      expect(onCloseSpy.calledOnce).to.be.true;
      expect(changeSeriesListSpy.calledOnce).to.be.true;

      const series = EssenceFixtures.wikiTable().series;
      const count: SeriesDefinition = series.getSeries(SeriesFixtures.wikiCount().reference);

      const newCount = count
        .set("format", PERCENT_FORMAT)
        .set("percentages", new SeriesPercentages({ ofTotal: true }));

      const changedSeries = EssenceFixtures.wikiTable().series.replaceSeries(count, newCount);

      expect(changeSeriesListSpy.firstCall.calledWith(changedSeries)).to.be.true;
    });
  });

  describe("validation", () => {
    it("ok should be enable after format change", () => {
      const menu = mountMenu();
      const ok = menu.find("Button[className='ok']");

      expect(ok.prop("disabled")).to.be.true;

      (menu.instance() as SeriesMenu).saveFormat(PERCENT_FORMAT);
      menu.update();

      const okAfterChange = menu.find("Button[className='ok']");
      expect(okAfterChange.prop("disabled")).to.be.false;
    });

    it("ok should be enable after percentages change", () => {
      const menu = mountMenu();
      const ok = menu.find("Button[className='ok']");

      expect(ok.prop("disabled")).to.be.true;

      (menu.instance() as SeriesMenu).savePercentages(new SeriesPercentages({ ofTotal: true }));
      menu.update();

      const okAfterChange = menu.find("Button[className='ok']");
      expect(okAfterChange.prop("disabled")).to.be.false;
    });

    it("ok should stay disabled after series revert", () => {
      const menu = mountMenu();
      const ok = menu.find("Button[className='ok']");

      expect(ok.prop("disabled")).to.be.true;

      (menu.instance() as SeriesMenu).saveFormat(PERCENT_FORMAT);
      menu.update();

      const okAfterChange = menu.find("Button[className='ok']");
      expect(okAfterChange.prop("disabled")).to.be.false;

      (menu.instance() as SeriesMenu).saveFormat(DEFAULT_FORMAT);
      menu.update();

      const okAfterRevert = menu.find("Button[className='ok']");
      expect(okAfterRevert.prop("disabled")).to.be.true;
    });
  });

  describe("<PercentagePicker>", () => {
    it("should be enabled when there are any splits", () => {
      const menu = mountMenu();
      const picker = menu.find(PercentagePicker);

      expect(picker.prop("disabled")).to.be.false;
    });

    it("should be disabled when there are no splits", () => {
      const essence = EssenceFixtures.twitterNoVisualisation();
      const menu = mountMenu({ essence });
      const picker = menu.find(PercentagePicker);

      expect(picker.prop("disabled")).to.be.true;
    });
  });
});
