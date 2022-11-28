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
import * as TestUtils from "react-dom/test-utils";
import { DimensionFixtures } from "../../../common/models/dimension/dimension.fixtures";
import { EssenceFixtures } from "../../../common/models/essence/essence.fixtures";
import { TimekeeperFixtures } from "../../../common/models/timekeeper/timekeeper.fixtures";
import { findDOMNode, renderIntoDocument } from "../../utils/test-utils";
import { NumberRangePicker } from "./number-range-picker";

describe("NumberRangePicker", () => {
  it("adds the correct class", () => {
    const renderedComponent = renderIntoDocument(
      <NumberRangePicker
        start={2}
        end={10}
        onRangeStartChange={null}
        essence={EssenceFixtures.wikiTotals()}
        timekeeper={TimekeeperFixtures.fixed()}
        dimension={DimensionFixtures.wikiCommentLength()}
        onRangeEndChange={null}
        exclude={false}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), "should be composite").to.equal(true);
    expect(findDOMNode(renderedComponent).className, "should contain class").to.contain("number-range-picker");
  });

});
