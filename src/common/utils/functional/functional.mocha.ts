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
import * as sinon from "sinon";
import { SinonSpy } from "sinon";
import { sleep } from "../../../client/utils/test-utils";
import { complement, concatTruthy, cons, constant, debounceWithPromise, flatMap, mapTruthy, range, thread, threadConditionally, threadNullable, zip } from "./functional";

const inc = (x: number) => x + 1;
const double = (x: number) => x * 2;
const nil = (): void => null;
const wrap = (...numbers: number[]) => numbers;

describe("Functional utilities", () => {

  describe("constant", () => {
    it("should return function that always returns initial argument", () => {
      const f = constant(42);
      expect(f()).to.eq(42);
    });
  });

  describe("cons", () => {
    it("should append to empty array", () => {
      expect(cons([], 1)).to.deep.eq([1]);
    });

    it("should keep nested arrays", () => {
      expect(cons([], [1])).to.deep.eq([[1]]);
    });
  });

  describe("zip", () => {
    it("should merge arrays with same length", () => {
      expect(zip([1, 2, 3], ["a", "b", "c"])).to.deep.eq([
        [1, "a"],
        [2, "b"],
        [3, "c"]
      ]);
    });

    it("should merge common subsets of arrays with different length (first array longer)", () => {
      expect(zip([1, 2, 3, 4], ["a", "b"])).to.deep.eq([
        [1, "a"],
        [2, "b"]
      ]);
    });

    it("should merge common subsets of arrays with different length (second array longer)", () => {
      expect(zip([1, 2], ["a", "b", "c", "d"])).to.deep.eq([
        [1, "a"],
        [2, "b"]
      ]);
    });
  });

  describe("range", () => {
    it("should return range from 0 to exclusive 3", () => {
      expect(range(0, 3)).to.deep.eq([0, 1, 2]);
    });

    it("should return range from 5 to exclusive 10", () => {
      expect(range(5, 10)).to.deep.eq([5, 6, 7, 8, 9]);
    });
  });

  describe("flatMap", () => {
    it("should flatten", () => {
      const result = flatMap([1, 3], (i: number) => wrap(i, inc(i)));
      expect(result).to.deep.eq([1, 2, 3, 4]);
    });

    it("should omit empty arrays as values", () => {
      const result = flatMap([1, 2, 3, 4], () => []);
      expect(result).to.deep.eq([]);
    });
  });

  describe("concatTruthy", () => {
    it("should omit falsy values", () => {
      const result = concatTruthy<any>(0, 1, false, 2, 3, null, 4, undefined, 5);
      expect(result).to.deep.eq([0, 1, 2, 3, 4, 5]);
    });
  });

  describe("mapTruthy", () => {
    it("should omit falsy values from mapper", () => {
      const result = mapTruthy<any, any>([1, 2, 3, 4, 5], (i: number) => i % 2 ? i : null);
      expect(result).to.deep.eq([1, 3, 5]);
    });
  });

  describe("thread", () => {
    it("should thread value through all functions", () => {
      const result = thread(1, inc, double, inc);
      expect(result).to.eq(5);
    });
  });

  describe("threadNullable", () => {
    it("should thread value through all function as long all return values are truthy", () => {
      const result = threadNullable(1, inc, double, inc);
      expect(result).to.eq(5);
    });

    it("should return falsy value if some function in thread returns falsy value", () => {
      const result = threadNullable(1, inc, nil, inc, inc);
      expect(result).to.eq(null);
    });
  });

  describe("threadConditionally", () => {
    it("should thread value through all function as long all functions are callable", () => {
      const result = threadConditionally(1, inc, double, inc);
      expect(result).to.eq(5);
    });

    it("should omit falsy values in call chain", () => {
      const result = threadConditionally(1, inc, undefined, double, null, inc);
      expect(result).to.eq(5);
    });
  });

  describe("complement", () => {
    it("should produce complement predicate", () => {
      const moreThanTen = (x: number) => x > 10;

      expect(moreThanTen(5)).to.be.not.equal(complement(moreThanTen)(5));
      expect(moreThanTen(15)).to.be.not.equal(complement(moreThanTen)(15));
    });
  });

  describe("debounceWithPromise", () => {
    let callSpy: SinonSpy;

    beforeEach(() => {
      callSpy = sinon.spy();
    });

    it("should call function once", async () => {
      const debounced = debounceWithPromise(callSpy, 10);
      debounced();
      debounced();
      debounced();
      expect(callSpy.callCount).to.eq(0);
      await sleep(10);
      expect(callSpy.callCount).to.eq(1);
    });

    it("should call function with argument of last invocation", async () => {
      const debounced = debounceWithPromise(callSpy, 10);
      debounced(1);
      debounced(2);
      debounced(3);
      await sleep(10);
      expect(callSpy.calledWith(3)).to.be.true;
    });

    it("should call function again after if time passes", async () => {
      const debounced = debounceWithPromise(callSpy, 10);
      debounced();
      debounced();
      debounced();
      expect(callSpy.callCount).to.eq(0);
      await sleep(10);
      expect(callSpy.callCount).to.eq(1);
      debounced();
      await sleep(10);
      expect(callSpy.callCount).to.eq(2);
    });

    it("should not call function after cancelation", async () => {
      const debounced = debounceWithPromise(callSpy, 10);
      debounced();
      debounced();
      debounced.cancel();
      await sleep(10);
      expect(callSpy.callCount).to.eq(0);
    });

    it("should return promise with value", async () => {
      const returnVal = 5;
      const debounced = debounceWithPromise(() => returnVal, 10);
      const x = await debounced();
      expect(x).to.be.eq(returnVal);
    });
  });
});
