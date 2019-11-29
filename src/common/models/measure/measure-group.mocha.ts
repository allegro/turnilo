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
import { MeasureGroup } from "./measure-group";
import { MeasureGroupFixtures } from "./measure-group.fixtures";

describe("MeasureGroup", () => {

  it("should convert to / from JS", () => {
    const measureGroup = MeasureGroup.fromJS(MeasureGroupFixtures.wikiAddedJS());

    expect(measureGroup.toJS()).to.deep.equal(MeasureGroupFixtures.wikiAddedJS());
  });

  it("should infer title from name", () => {
    const measureGroup = MeasureGroup.fromJS(MeasureGroupFixtures.noTitleJS());

    expect(measureGroup.toJS()).to.deep.equal(MeasureGroupFixtures.withTitleInferredJS());
  });

  it("should infer title from name", () => {
    const measureGroup = MeasureGroup.fromJS(MeasureGroupFixtures.noTitleJS());

    expect(measureGroup.toJS()).to.deep.equal(MeasureGroupFixtures.withTitleInferredJS());
  });

  it("should throw when no name given", () => {
    const measureGroupConversion = () => MeasureGroup.fromJS(MeasureGroupFixtures.noNameJS());

    expect(measureGroupConversion).to.throw("measure group requires a name");
  });

  it("should throw when no measures given", () => {
    const groupWithNoMeasures = MeasureGroupFixtures.noMeasuresJS();
    const measureGroupConversion = () => MeasureGroup.fromJS(groupWithNoMeasures);

    expect(measureGroupConversion).to.throw(`measure group '${groupWithNoMeasures.name}' has no measures`);
  });

  it("should throw when empty measures given", () => {
    const groupWithEmptyMeasures = MeasureGroupFixtures.emptyMeasuresJS();
    const measureGroupConversion = () => MeasureGroup.fromJS(groupWithEmptyMeasures);

    expect(measureGroupConversion).to.throw(`measure group '${groupWithEmptyMeasures.name}' has no measures`);
  });

});
