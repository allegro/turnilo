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
import { Dataset, Datum } from "plywood";
import { SPLIT } from "../../../config/constants";
import { makeDataset } from "./dataset-fixtures";
import { selectFirstSplitDataset, selectFirstSplitDatums, selectMainDatum, selectSplitDataset, selectSplitDatums } from "./selectors";

const datum = { foobar: 100 };
const dataset = Dataset.fromJS([datum]);
const splitDatum = (data: unknown) => ({ [SPLIT]: data }) as Datum;

describe("dataset selectors", () => {
  describe("selectMainDatum", () => {
    it("should pick first datum", () => {
      expect(selectMainDatum(dataset)).to.deep.equal(datum);
    });
  });

  describe("selectSplitDataset", () => {
    it("should pick SPLIT prop", () => {
      expect(selectSplitDataset(splitDatum("foobar"))).to.equal("foobar");
    });
  });

  describe("selectSplitDatums", () => {
    it("should pick datums from SPLIT prop", () => {
      expect(selectSplitDatums(splitDatum(dataset))).to.deep.equal([datum]);
    });
  });

  describe("selectFirstSplitDataset", () => {
    it("should pick SPLIT prop for main Datum", () => {
      expect(selectFirstSplitDataset(makeDataset([datum]))).to.deep.equal(dataset);
    });
  });
  describe("selectFirstSplitDatums", () => {
    it("should pick datums from SPLIT prop for main Datum", () => {
      expect(selectFirstSplitDatums(makeDataset([datum]))).to.deep.equal([datum]);
    });
  });
});
