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
import { List } from "immutable";
import {
  ensureOneOf,
  inlineVars,
  isBlank,
  isDecimalInteger,
  isFiniteNumber,
  isNil,
  isNumber,
  isObject,
  isTruthy,
  makeTitle,
  moveInList,
  optionalEnsureOneOf,
  readNumber,
  verifyUrlSafeName
} from "./general";

describe("General", () => {
  describe("moveInList", () => {
    it("works in simple case 0", () => {
      const list = List("ABCD".split(""));
      expect(moveInList(list, 0, 0).join("")).to.equal("ABCD");
    });

    it("works in simple case 1", () => {
      const list = List("ABCD".split(""));
      expect(moveInList(list, 0, 1).join("")).to.equal("ABCD");
    });

    it("works in simple case 2", () => {
      const list = List("ABCD".split(""));
      expect(moveInList(list, 0, 2).join("")).to.equal("BACD");
    });

    it("works in simple case 3", () => {
      const list = List("ABCD".split(""));
      expect(moveInList(list, 0, 3).join("")).to.equal("BCAD");
    });

    it("works in simple case 4", () => {
      const list = List("ABCD".split(""));
      expect(moveInList(list, 0, 4).join("")).to.equal("BCDA");
    });

  });

  describe("verifyUrlSafeName", () => {
    it("works in good case", () => {
      verifyUrlSafeName("a_b-c.d~E059");
    });

    it("works in bad case", () => {
      expect(() => {
        verifyUrlSafeName("abcd%po#@$moon is!cool");
      }).to.throw("'abcd%po#@$moon is!cool' is not a URL safe name. Try 'abcd_po_moon_is_cool' instead?");
    });

  });

  describe("makeTitle", () => {
    it("works in simple snake case", () => {
      expect(makeTitle("hello_world")).to.equal("Hello World");
    });

    it("works in simple camel case", () => {
      expect(makeTitle("helloWorld")).to.equal("Hello World");
    });

    it("works with leading and trailing _", () => {
      expect(makeTitle("_hello_world_")).to.equal("Hello World");
    });

    it("works with trailing numbers in the middle", () => {
      expect(makeTitle("hello99_world")).to.equal("Hello99 World");
    });

    it("works with trailing numbers at the end", () => {
      expect(makeTitle("hello_world99")).to.equal("Hello World99");
    });

  });

  describe("inlineVars", () => {
    it("works in simple case", () => {
      const json: any = {
        "hello": 1,
        "port": "%{PORT}%",
        "fox says %{}%": "%{FOX_SAYS}%"
      };

      const vars: Record<string, string> = {
        PORT: "1234",
        FOX_SAYS: "Meow"
      };

      expect(inlineVars(json, vars)).to.deep.equal({
        "hello": 1,
        "port": "1234",
        "fox says %{}%": "Meow"
      });
    });

    it("throw error if can not find var", () => {
      const json: any = {
        "hello": 1,
        "port": "%{PORT}%",
        "fox says %{}%": "%{FOX_SAYS}%"
      };

      const vars: Record<string, string> = {
        PORT: "1234"
      };

      expect(() => inlineVars(json, vars)).to.throw("could not find variable 'FOX_SAYS'");
    });

  });

  describe("ensureOneOf", () => {
    it("does not thrown an error is one of", () => {
      ensureOneOf("Honda", ["Honda", "Toyota", "BMW"], "Car");
    });

    it("throws error if not one of", () => {
      expect(() => {
        ensureOneOf("United Kingdom", ["Honda", "Toyota", "BMW"], "Car");
      }).to.throw("Car must be one of 'Honda', 'Toyota', 'BMW' (is 'United Kingdom')");
    });

    it("throws error if not defined", () => {
      expect(() => {
        ensureOneOf(undefined, ["Honda", "Toyota", "BMW"], "Car");
      }).to.throw("Car must be one of 'Honda', 'Toyota', 'BMW' (is not defined)");
    });
  });

  describe("optionalEnsureOneOF", () => {
    it("does not throw an error is one of", () => {
      optionalEnsureOneOf("Honda", ["Honda", "Toyota", "BMW"], "Car");
    });

    it("does not throw an error is not defined", () => {
      optionalEnsureOneOf(null, ["Honda", "Toyota", "BMW"], "Car");
    });

    it("throws error not one of", () => {
      expect(() => {
        optionalEnsureOneOf("United Kingdom", ["Honda", "Toyota", "BMW"], "Car");
      }).to.throw("Car must be one of 'Honda', 'Toyota', 'BMW' (is 'United Kingdom')");
    });
  });

  describe("isDecimalInteger", () => {
    it("should return false for invalid numbers", () => {
      expect(isDecimalInteger(null), "<null>").to.be.false;
      expect(isDecimalInteger(""), "empty string").to.be.false;
      expect(isDecimalInteger("foobar"), "foobar").to.be.false;
    });

    it("should return false for floats", () => {
      expect(isDecimalInteger("1.23"), "float").to.be.false;
      expect(isDecimalInteger("1e4"), "scientific notation").to.be.false;
    });

    it("should return false for non decimal numbers", () => {
      expect(isDecimalInteger("0xdeadbeef"), "hex").to.be.false;
      expect(isDecimalInteger("0o1234"), "octal").to.be.false;
      expect(isDecimalInteger("0b010101"), "binary").to.be.false;
    });

    it("should return false for numbers with additional characters", () => {
      expect(isDecimalInteger("1234foobar"), "1234foobar").to.be.false;
    });
  });

  describe("readNumber", () => {
    it("should return number if number passed", () => {
      expect(readNumber(123)).to.equal(123);
    });

    it("should parse string to float", () => {
      expect(readNumber("1"), "integer").to.equal(1);
      expect(readNumber("1.1"), "float").to.equal(1.1);
    });

    it("should return NaN if not a number", () => {
      expect(readNumber("foobar"), "foobar").to.be.NaN;
      expect(readNumber("NaN"), "NaN").to.be.NaN;
      expect(readNumber(null), "<null>").to.be.NaN;
      expect(readNumber(undefined), "<undefined>").to.be.NaN;
    });
  });

  describe("isNil", () => {
    it("should return true for null", () => {
      expect(isNil(null)).to.be.true;
    });

    it("should return true for undefined", () => {
      expect(isNil(undefined)).to.be.true;
    });

    it("should return false for 0", () => {
      expect(isNil(0)).to.be.false;
    });

    it("should return false for empty string", () => {
      expect(isNil("")).to.be.false;
    });
  });

  describe("isObject", () => {
    it("should return true for empty object", () => {
      expect(isObject({})).to.be.true;
    });

    it("should return true for non-empty object", () => {
      expect(isObject({ foo: "bar" })).to.be.true;
    });

    it("should return false for null", () => {
      expect(isObject(null)).to.be.false;
    });

    it("should return false for string", () => {
      expect(isObject("foobar")).to.be.false;
    });
  });

  describe("isTruthy", () => {
    it("should return false for null", () => {
      expect(isTruthy(null)).to.be.false;
    });

    it("should return false for undefined", () => {
      expect(isTruthy(undefined)).to.be.false;
    });

    it("should return false for false", () => {
      expect(isTruthy(false)).to.be.false;
    });

    it("should return true for 0", () => {
      expect(isTruthy(0)).to.be.true;
    });

    it("should return true for empty string", () => {
      expect(isTruthy("")).to.be.true;
    });
  });

  describe("isBlank", () => {
    it("should return false for non-empty string", () => {
      expect(isBlank("foobar")).to.be.false;
    });

    it("should return true for empty string", () => {
      expect(isBlank("")).to.be.true;
    });
  });

  describe("isNumber", () => {
    it("should return false for string", () => {
      expect(isNumber("foobar")).to.be.false;
    });

    it("should return false for null", () => {
      expect(isNumber(null)).to.be.false;
    });

    it("should return false for undefined", () => {
      expect(isNumber(undefined)).to.be.false;
    });

    it("should return true for integer", () => {
      expect(isNumber(42)).to.be.true;
    });

    it("should return true for float", () => {
      expect(isNumber(0.000000003)).to.be.true;
    });
  });

  describe("isFiniteNumber", () => {
    it("should return false for NaN", () => {
      expect(isFiniteNumber(NaN)).to.be.false;
    });

    it("should return false for +Infinity", () => {
      expect(isFiniteNumber(+Infinity)).to.be.false;
    });

    it("should return false for -Infinity", () => {
      expect(isFiniteNumber(-Infinity)).to.be.false;
    });

    it("should return false for null", () => {
      expect(isFiniteNumber(null)).to.be.false;
    });

    it("should return false for undefined", () => {
      expect(isFiniteNumber(undefined)).to.be.false;
    });

    it("should return true for integer", () => {
      expect(isFiniteNumber(42)).to.be.true;
    });

    it("should return true for float", () => {
      expect(isFiniteNumber(0.0000003)).to.be.true;
    });
  });
});
