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
import { Record } from "immutable";
import nullableEquals from "./nullable-equals";

interface DummyValue {
  dummy: number;
}

class DummyRecord extends Record<DummyValue>({ dummy: 1 }) {

}

const dummy = (dummy: number) => new DummyRecord({ dummy });

describe("nullable equals", () => {
  describe("should return true", () => {
    it("for both nulls", () => {
      expect(nullableEquals(null, null)).to.be.true;
    });

    it("for same value", () => {
      const val = dummy(1);
      expect(nullableEquals(val, val)).to.be.true;
    });

    it("for identical values", () => {
      expect(nullableEquals(dummy(1), dummy(1))).to.be.true;
    });
  });

  describe("should return false", () => {
    it("if only first is null", () => {
      expect(nullableEquals(null, dummy(1))).to.be.false;
    });

    it("if only second is null", () => {
      expect(nullableEquals(dummy(1), null)).to.be.false;
    });

    it("for different values", () => {
      expect(nullableEquals(dummy(1), dummy(2))).to.be.false;
      expect(nullableEquals(dummy(25), dummy(80))).to.be.false;
    });
  });
});
