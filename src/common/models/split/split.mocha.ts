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
import { Timezone } from "chronoshift";
import * as sinon from "sinon";
import * as formatterModule from "../../utils/formatter/formatter";
import { Split } from "./split";

describe("Split", () => {
  describe("selectValue", () => {
    it("should select property under own key", () => {
      const split = new Split({ reference: "foobar" });
      const datum = { foobar: 42 };

      expect(split.selectValue(datum)).to.equal(42);
    });
  });

  describe("formatValue", () => {
    let formatValueStub: sinon.SinonStub;

    beforeEach(() => {
      formatValueStub = sinon.stub(formatterModule, "formatValue");
    });

    it("should select property under own key and pass for formatValue", () => {
      const timezone = "timezone-string" as unknown as Timezone;
      const split = new Split({ reference: "foobar" });
      const datum = { foobar: 42 };

      split.formatValue(datum, timezone);

      expect(formatValueStub.calledWith(42, timezone)).to.be.true;
    });

    afterEach(() => {
      formatValueStub.restore();
    });
  });
});
