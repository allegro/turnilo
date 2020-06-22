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
import { Dataset } from "plywood";
import * as sinon from "sinon";
import { Essence } from "../../../../../common/models/essence/essence";
import * as selectorsModule from "../../../../utils/dataset/selectors/selectors";
import * as splitsModule from "./splits";
import { getXDomain } from "./x-domain";

describe("getXDomain", () => {
  const essence: Essence = "essence" as any as Essence;
  const dataset: Dataset = "dataset" as any as Dataset;

  let firstSplitRefStub: sinon.SinonStub;
  let selectFirstSplitDatumsStub: sinon.SinonStub;

  beforeEach(() => {
    firstSplitRefStub = sinon
      .stub(splitsModule, "firstSplitRef")
      .returns("dummy-ref");

    selectFirstSplitDatumsStub = sinon
      .stub(selectorsModule, "selectFirstSplitDatums")
      .returns([
        { "dummy-ref": "foo" },
        { "dummy-ref": "bar" },
        { "dummy-ref": "bazz" },
        { "dummy-ref": "qvux" }
      ]);
  });

  afterEach(() => {
    firstSplitRefStub.restore();
    selectFirstSplitDatumsStub.restore();
  });

  it("should call firstSplitRef with passed essence", () => {
    getXDomain(essence, dataset);
    expect(firstSplitRefStub.calledWith(essence)).to.be.true;
  });

  it("should call selectFirstSplitDatums with passed dataset", () => {
    getXDomain(essence, dataset);
    expect(selectFirstSplitDatumsStub.calledWith(dataset)).to.be.true;
  });

  it("should pick split values from datums", () => {
    const domain = getXDomain(essence, dataset);
    expect(domain).to.be.deep.equal(["foo", "bar", "bazz", "qvux"]);
  });
});
