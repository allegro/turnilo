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
import * as sinon from "sinon";
import { EssenceFixtures } from "../../../../common/models/essence/essence.fixtures";
import * as formatterModule from "../../../../common/utils/formatter/formatter";
import * as datumByPositionModule from "./datum-by-position";
import { modalTitle } from "./modal-title";

const essence = EssenceFixtures.wikiHeatmap();

describe("modalTitle", () => {

  let datumByPosStub: sinon.SinonStub;
  let formatSegmentStub: sinon.SinonStub;

  beforeEach(() => {
    datumByPosStub = sinon
      .stub(datumByPositionModule, "default")
      .returns([
        { channel: "row-channel", namespace: "row-namespace" },
        { namespace: "column-namespace", channel: "column-channel" }
      ]);

    formatSegmentStub = sinon
      .stub(formatterModule, "formatSegment")
      .returns("formatted-segment");
  });

  afterEach(() => {
    datumByPosStub.restore();
    formatSegmentStub.restore();
  });

  it("should call datumByPosition with correct params", () => {
    modalTitle("position" as any, "dataset" as any, essence);
    expect(datumByPosStub.calledWith("dataset", "position")).to.be.true;
  });

  it("should call formatSegments with correct params", () => {
    modalTitle(null, null, essence);
    expect(formatSegmentStub.calledTwice).to.be.true;
    expect(formatSegmentStub.calledWith("row-channel", essence.timezone)).to.be.true;
    expect(formatSegmentStub.calledWith("column-namespace", essence.timezone)).to.be.true;
  });
});
