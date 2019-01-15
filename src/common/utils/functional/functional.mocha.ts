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
import * as sinon from "sinon";
import { SinonSpy } from "sinon";
import { sleep } from "../../../client/utils/test-utils";
import { complement, concatTruthy, cons, debounce, flatMap, mapTruthy, thread, threadTruthy } from "./functional";

const inc = (x: number) => x + 1;
const double = (x: number) => x * 2;
const nil = (): void => null;
const wrap = (...numbers: number[]) => numbers;

describe("Functional utilities", () => {

  describe("cons", () => {
    it("should append to empty array", () => {
      expect(cons([], 1)).to.deep.eq([1]);
    });

    it("should keep nested arrays", () => {
      expect(cons([], [1])).to.deep.eq([[1]]);
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

  describe("threadTruthy", () => {
    it("should thread value through all function as long all return values are truthy", () => {
      const result = threadTruthy(1, inc, double, inc);
      expect(result).to.eq(5);
    });

    it("should return falsy value if some function in thread returns falsy value", () => {
      const result = threadTruthy(1, inc, nil, inc, inc);
      expect(result).to.eq(null);
    });
  });

  describe("complement", () => {
    it("should produce complement predicate", () => {
      const moreThanTen = (x: number) => x > 10;

      expect(moreThanTen(5)).to.be.not.equal(complement(moreThanTen)(5));
      expect(moreThanTen(15)).to.be.not.equal(complement(moreThanTen)(15));
    });
  });

  describe("debounce", () => {
    let callSpy: SinonSpy;

    beforeEach(() => {
      callSpy = sinon.spy();
    });

    it("should call function once", async () => {
      const debounced = debounce(callSpy, 10);
      debounced();
      debounced();
      debounced();
      expect(callSpy.callCount).to.eq(0);
      await sleep(10);
      expect(callSpy.callCount).to.eq(1);
    });

    it("should call function with argument of last invocation", async () => {
      const debounced = debounce(callSpy, 10);
      debounced(1);
      debounced(2);
      debounced(3);
      await sleep(10);
      expect(callSpy.calledWith(3)).to.be.true;
    });

    it("should call function again after if time passes", async () => {
      const debounced = debounce(callSpy, 10);
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
      const debounced = debounce(callSpy, 10);
      debounced();
      debounced();
      debounced.cancel();
      await sleep(10);
      expect(callSpy.callCount).to.eq(0);
    });
  });
});
