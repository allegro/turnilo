/*
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
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-dom/test-utils";
import { EssenceFixtures } from "../../../common/models/fixtures";
import { SortOn } from "../../../common/models/index";
import { renderIntoDocument } from "../../utils/test-utils";
import { PinboardMeasureTile } from "./pinboard-measure-tile";

describe("PinboardMeasureTile", () => {
  it("adds the correct class", () => {

    var essence = EssenceFixtures.wikiTotals();
    var sortOn = new SortOn({ dimension: essence.dataCube.getDimension("articleName") });

    var renderedComponent = renderIntoDocument(
      <PinboardMeasureTile
        essence={essence}
        title="Pinboard"
        sortOn={sortOn}
        onSelect={null}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), "should be composite").to.equal(true);
    expect(ReactDOM.findDOMNode(renderedComponent).className, "should contain class").to.contain("pinboard-measure-tile");
  });

});
