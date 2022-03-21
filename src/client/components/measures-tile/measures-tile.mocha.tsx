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
import React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-dom/test-utils";
import { Clicker } from "../../../common/models/clicker/clicker";
import { EssenceFixtures } from "../../../common/models/essence/essence.fixtures";
import { renderIntoDocument } from "../../utils/test-utils";
import { MeasuresTile } from "./measures-tile";

describe("MeasuresTile", () => {
  it("adds the correct class", () => {
    const fakeClicker: Clicker = {
      addSeries: () => {
      }
    };

    const renderedComponent = renderIntoDocument(
      <MeasuresTile
        addPartialSeries={null}
        clicker={fakeClicker}
        menuStage={null}
        essence={EssenceFixtures.wikiTotals()}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), "should be composite").to.equal(true);
    expect((ReactDOM.findDOMNode(renderedComponent) as Element).className, "should contain class").to.contain("measures-tile");
  });

});
