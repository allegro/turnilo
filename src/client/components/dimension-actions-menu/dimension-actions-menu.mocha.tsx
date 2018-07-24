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
import * as React from "react";
import * as TestUtils from "react-dom/test-utils";
import { DimensionFixtures, EssenceFixtures, StageFixtures } from "../../../common/models/fixtures";
import { findDOMNode, renderIntoDocument } from "../../utils/test-utils";
import { DimensionActionsMenu } from "./dimension-actions-menu";

describe("DimensionActionsMenu", () => {
  it("adds the correct class", () => {
    var openOn = document.createElement("div");

    var renderedComponent = renderIntoDocument(
      <DimensionActionsMenu
        clicker={null}
        containerStage={StageFixtures.defaultA()}
        dimension={DimensionFixtures.countryURL()}
        direction={"right"}
        essence={EssenceFixtures.wikiTotals()}
        onClose={null}
        openOn={openOn}
        triggerFilterMenu={null}
        triggerSplitMenu={null}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), "should be composite").to.equal(true);
    expect(findDOMNode(renderedComponent).className, "should contain class").to.contain("dimension-actions-menu");
  });

});
