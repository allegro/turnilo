/*
 * Copyright 2015-2016 Imply Data, Inc.
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
import { shallow } from "enzyme";
import { Datum } from "plywood";
import * as React from "react";
import { MeasureDerivation } from "../../../common/models/measure/measure";
import { MeasureFixtures } from "../../../common/models/measure/measure.fixtures";
import { DEFAULT_FORMAT } from "../../../common/models/series/series";
import { Delta } from "../delta/delta";
import { VisMeasureLabel } from "./vis-measure-label";

const measure = MeasureFixtures.wikiCount();

const datum: Datum = { [measure.name]: 10000, [measure.getDerivedName(MeasureDerivation.PREVIOUS)]: 200 };

describe("VisMeasureLabel", () => {
  it("renders measure data", () => {
    const renderedComponent = shallow(
      <VisMeasureLabel
        measure={MeasureFixtures.wikiCount()}
        format={DEFAULT_FORMAT}
        datum={datum}
        showPrevious={false}
      />
    );

    expect(renderedComponent.find(".measure-title").text()).to.be.eq(measure.title);
    expect(renderedComponent.find(".measure-value").text()).to.be.eq("10.0 k");
  });

  it("renders previous", () => {
    const renderedComponent = shallow(
      <VisMeasureLabel
        measure={MeasureFixtures.wikiCount()}
        format={DEFAULT_FORMAT}
        datum={datum}
        showPrevious={true}
      />
    );

    expect(renderedComponent.find(".measure-previous-value").text()).to.be.eq("200.0");
    expect(renderedComponent.find(Delta)).to.be.not.empty;
  });
});
