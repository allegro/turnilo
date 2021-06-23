/*
 * Copyright 2017-2021 Allegro.pl
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
import { List } from "immutable";
import { PseudoDatum, Splits } from "plywood";
import * as sinon from "sinon";
import { EssenceFixtures } from "../../../../common/models/essence/essence.fixtures";
import { stringIn } from "../../../../common/models/filter-clause/filter-clause.fixtures";
import { Highlight } from "../../highlight-controller/highlight";
import * as getFilterForDatumModule from "./filter-for-datum";
import { getRowIndexForHighlight } from "./get-row-index-for-highlight";

const essenceFixture = EssenceFixtures.wikiTable();
const channelFilter = (value: string) => List([stringIn("channel", [value])]);
const highlightMock = (value: string) => new Highlight(channelFilter(value), null);
const mockData: PseudoDatum[] = [
  { channel: "bazz" },
  { channel: "foobar" },
  { channel: "qvux" }
];

describe("getRowIndexForHighlight", () => {

  let getFilterForDatumStub: sinon.SinonStub;

  beforeEach(() => {
    getFilterForDatumStub = sinon
      .stub(getFilterForDatumModule, "getFilterFromDatum")
      .callsFake((splits: Splits, datum: PseudoDatum) => channelFilter(datum.channel));
  });

  afterEach(() => {
    getFilterForDatumStub.restore();
  });

  it("should return null if there is no data", () => {
    const index = getRowIndexForHighlight(essenceFixture, null, null);
    expect(index).to.be.null;
  });

  it("should return null if there is no highlight", () => {
    const index = getRowIndexForHighlight(essenceFixture, null, mockData);
    expect(index).to.be.null;
  });

  it("should find correct index", () => {
    const index = getRowIndexForHighlight(essenceFixture, highlightMock("foobar"), mockData);
    expect(index).to.be.equal(1);
  });

  it("should return null if can't find row", () => {
    const index = getRowIndexForHighlight(essenceFixture, highlightMock("nonsense"), mockData);
    expect(index).to.be.equal(null);
  });
});
