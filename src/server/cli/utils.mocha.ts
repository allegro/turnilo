/*
 * Copyright 2017-2022 Allegro.pl
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
import { InvalidArgumentError } from "commander";
import { parseCredentials, parseInteger } from "./utils";

describe("CLI utils", () => {
  describe("parseInteger", () => {
    it("should parse valid integer", () => {
      expect(parseInteger("9090")).to.be.equal(9090);
    });

    it("should throw InvalidArgumentError on invalid integer", () => {
      expect(() => parseInteger("foobar")).to.throw(InvalidArgumentError);
    });

    it("should throw with message on invalid integer", () => {
      expect(() => parseInteger("foobar")).to.throw("Must be an integer");
    });
  });

  describe("parseCredentials", () => {
    it("should pass undefined if both parameters are undefined", () => {
      expect(parseCredentials(undefined, undefined, "http-basic")).to.be.undefined;
    });

    it("should return ClusterAuth object with username, password and type", () => {
      expect(parseCredentials("foobar", "secret", "http-basic")).to.be.deep.equal({
        username: "foobar",
        password: "secret",
        type: "http-basic"
      });
    });

    it("should throw InvalidArgumentError on missing password", () => {
      expect(() => parseCredentials("foobar", undefined, "http-basic")).to.throw(InvalidArgumentError);
    });

    it("should throw with message on missing password", () => {
      expect(() => parseCredentials("foobar", undefined, "http-basic")).to.throw("Expected password for username");
    });

    it("should throw InvalidArgumentError on missing username", () => {
      expect(() => parseCredentials(undefined, "secret", "http-basic")).to.throw(InvalidArgumentError);
    });

    it("should throw with message on missing username", () => {
      expect(() => parseCredentials(undefined, "secret", "http-basic")).to.throw("Expected username for password");
    });
  });

});
