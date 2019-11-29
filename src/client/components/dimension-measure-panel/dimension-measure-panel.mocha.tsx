/*
 * Copyright 2015-2016 Imply Data, Inc.
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
import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { DataCubeFixtures } from "../../../common/models/data-cube/data-cube.fixtures";
import { EssenceFixtures } from "../../../common/models/essence/essence.fixtures";
import { ResizeHandle } from "../resize-handle/resize-handle";
import { DimensionMeasurePanel, initialPosition, MIN_PANEL_SIZE } from "./dimension-measure-panel";

describe("DimensionMeasurePanel", () => {
  function renderPanel() {
    const clickyMcClickFace: Clicker = {
      addSeries: () => {
      }
    };
    return shallow(
      <DimensionMeasurePanel
        appendDirtySeries={null}
        clicker={clickyMcClickFace}
        essence={EssenceFixtures.wikiTotals()}
        menuStage={null}
        triggerFilterMenu={null}
      />
    );
  }

  describe("<DimensionMeasurePanel>", () => {
    it("adds the correct class", () => {
      const panel = renderPanel();
      expect(panel.hasClass("dimension-measure-panel"), "should contain class").to.be.true;
    });

    it("should hide resize panel at start", () => {
      const panel = renderPanel();
      expect(panel.children(ResizeHandle).length).to.be.eq(0);
    });
  });

  describe("initialPosition", () => {
    [300, 500, 1000].forEach(height => {
      it(`should calculate position according to ratio for height ${height}`, () => {
        const position = initialPosition(height, DataCubeFixtures.wiki());

        expect(position, "lower than total height").to.be.lt(height);
        expect(position, "should leave minimal space for dimensions").to.be.gte(MIN_PANEL_SIZE);
        expect(position, "should leave minimal space for measures").to.be.lte(height - MIN_PANEL_SIZE);
        expect(position, "should leave more space for dimensions").to.be.gt(height - position);
      });
    });
  });
});
