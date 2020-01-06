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
import { omitFalsyValues } from "./object";

describe("Object utils", () => {
  describe("omitFalsyValues", () => {
    it("should omit falsy values", () => {
      const input: any = {
        a: 0,
        b: false,
        c: undefined,
        d: null,
        e: 1,
        f: "str"
      };
      const output: any = {
        a: 0,
        e: 1,
        f: "str"
      };
      expect(omitFalsyValues(input)).to.be.deep.equal(output);
    });

    it("should handle empty object", () => {
      expect(omitFalsyValues({})).to.be.deep.equal({});
    });

    it("should not modify input object", () => {
      const input: any = {
        a: null,
        b: undefined,
        c: false,
        d: "str"
      };

      const inputCopy = Object.assign({}, input);

      omitFalsyValues(input);

      expect(input).to.deep.equal(inputCopy);
    });
  });
});
