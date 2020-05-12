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

import { expect, use } from "chai";
import { EssenceFixtures } from "../../../../common/models/essence/essence.fixtures";
import equivalent from "../../../utils/test-utils/equivalent";
import { getContinuousDimension, getContinuousReference, getContinuousSplit, getNominalDimension, getNominalSplit, hasNominalSplit } from "./splits";

use(equivalent);

const essenceWithNominalSplit = EssenceFixtures.wikiLineChart();
const essenceWithoutNominalSplit = EssenceFixtures.wikiLineChartNoNominalSplit();
const timeDimension = essenceWithNominalSplit.getTimeDimension();
const channelDimension = essenceWithNominalSplit.dataCube.getDimension("channel");
const timeSplit = essenceWithNominalSplit.splits.findSplitForDimension(timeDimension);
const channelSplit = essenceWithNominalSplit.splits.findSplitForDimension(channelDimension);

describe("splits", () => {
  describe("without nominal split", () => {
    describe("getContinuousSplit", () => {
      it("should pick continuous split", () => {
        expect(getContinuousSplit(essenceWithoutNominalSplit)).to.be.equivalent(timeSplit);
      });
    });

    describe("getContinuousDimension", () => {
      it("should pick continuous dimension", () => {
        expect(getContinuousDimension(essenceWithoutNominalSplit)).to.be.equivalent(timeDimension);
      });
    });

    describe("getContinuousReference", () => {
      it("should pick continuous reference", () => {
        expect(getContinuousReference(essenceWithoutNominalSplit)).to.be.equal("time");
      });
    });

    describe("getNominalSplit", () => {
      it("should return null", () => {
        expect(getNominalSplit(essenceWithoutNominalSplit)).to.be.null;
      });
    });

    describe("getNominalDimension", () => {
      it("should return null", () => {
        expect(getNominalDimension(essenceWithoutNominalSplit)).to.be.null;
      });
    });

    describe("hasNominalSplit", () => {
      it("should return false", () => {
        expect(hasNominalSplit(essenceWithoutNominalSplit)).to.be.false;
      });
    });
  });

  describe("with nominal split", () => {
    describe("getContinuousSplit", () => {
      it("should pick continuous split", () => {
        expect(getContinuousSplit(essenceWithNominalSplit)).to.be.equivalent(timeSplit);
      });
    });

    describe("getContinuousDimension", () => {
      it("should pick continuous dimension", () => {
        expect(getContinuousDimension(essenceWithNominalSplit)).to.be.equivalent(timeDimension);
      });
    });

    describe("getContinuousReference", () => {
      it("should pick continuous reference", () => {
        expect(getContinuousReference(essenceWithNominalSplit)).to.be.equal("time");
      });
    });

    describe("getNominalSplit", () => {
      it("should return null", () => {
        expect(getNominalSplit(essenceWithNominalSplit)).to.be.equivalent(channelSplit);
      });
    });

    describe("getNominalDimension", () => {
      it("should return null", () => {
        expect(getNominalDimension(essenceWithNominalSplit)).to.be.equivalent(channelDimension);
      });
    });

    describe("hasNominalSplit", () => {
      it("should return false", () => {
        expect(hasNominalSplit(essenceWithNominalSplit)).to.be.true;
      });
    });
  });

});
