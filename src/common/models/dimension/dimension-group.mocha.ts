/*
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
import { DimensionGroup } from "./dimension-group";
import { DimensionGroupFixtures } from "./dimension-group.fixtures";

describe("DimensionGroup", () => {

  it("should convert to / from JS", () => {
    const dimensionGroup = DimensionGroup.fromJS(DimensionGroupFixtures.commentsJS());

    expect(dimensionGroup.toJS()).to.deep.equal(DimensionGroupFixtures.commentsJS());
  });

  it("should infer title from name", () => {
    const dimensionGroup = DimensionGroup.fromJS(DimensionGroupFixtures.noTitleJS());

    expect(dimensionGroup.toJS()).to.deep.equal(DimensionGroupFixtures.withTitleInferredJS());
  });

  it("should infer title from name", () => {
    const dimensionGroup = DimensionGroup.fromJS(DimensionGroupFixtures.noTitleJS());

    expect(dimensionGroup.toJS()).to.deep.equal(DimensionGroupFixtures.withTitleInferredJS());
  });

  it("should throw when no name given", () => {
    const dimensionGroupConversion = () => DimensionGroup.fromJS(DimensionGroupFixtures.noNameJS());

    expect(dimensionGroupConversion).to.throw("dimension group requires a name");
  });

  it("should throw when no dimensions given", () => {
    const groupWithNoDimensions = DimensionGroupFixtures.noDimensionsJS();
    const dimensionGroupConversion = () => DimensionGroup.fromJS(groupWithNoDimensions);

    expect(dimensionGroupConversion).to.throw(`dimension group '${groupWithNoDimensions.name}' has no dimensions`);
  });

  it("should throw when empty dimensions given", () => {
    const groupWithEmptyDimensions = DimensionGroupFixtures.emptyDimensionsJS();
    const dimensionGroupConversion = () => DimensionGroup.fromJS(groupWithEmptyDimensions);

    expect(dimensionGroupConversion).to.throw(`dimension group '${groupWithEmptyDimensions.name}' has no dimensions`);
  });

});
