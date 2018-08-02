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
import { complement, concatTruthy, cons, flatMap, mapTruthy, thread, threadTruthy } from "./functional";

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

});
