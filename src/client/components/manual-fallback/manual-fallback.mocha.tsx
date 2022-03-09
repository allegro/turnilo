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
import React from "react";
import { EssenceFixtures } from "../../../common/models/essence/essence.fixtures";
import { MessageCard } from "../message-card/message-card";
import { ManualFallback } from "./manual-fallback";

const renderFallback = () => shallow(
  <ManualFallback
    clicker={null}
    essence={EssenceFixtures.wikiLineChartNoSplits()}
  />
);

describe("ManualFallback", () => {
  it("should render MessageCard", () => {
    const fallback = renderFallback();
    const card = fallback.find(MessageCard);

    expect(card.exists()).to.be.true;
  });

  it("should pass visResolve message to MessageCard", () => {
    const fallback = renderFallback();
    const titleProp = fallback.find(MessageCard).prop("title");

    expect(titleProp).to.be.equal("This visualization requires a continuous dimension split");
  });

  it("should render resolutions", () => {
    const fallback = renderFallback();
    const resolutions = fallback.find(".resolution-item");

    expect(resolutions.length).to.be.equal(2);
  });

  it("should render first resolution with correct text", () => {
    const fallback = renderFallback();
    const firstResolution = fallback.find(".resolution-item").first();

    expect(firstResolution.text()).to.be.equal("Add a split on Time");
  });

  it("should render resolutions", () => {
    const fallback = renderFallback();
    const secondResolution = fallback.find(".resolution-item").at(1);

    expect(secondResolution.text()).to.be.equal("Add a split on Comment Length");
  });
});
