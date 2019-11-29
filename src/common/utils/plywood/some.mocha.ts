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
import { $, CountDistinctExpression, Expression, RefExpression } from "plywood";
import some from "./some";

const isRefExp = (e: Expression) => e instanceof RefExpression;

describe("Plywood Expression.some", () => {
  it("should return true for top-level value satisfies predicate", () => {
    expect(some($("main"), isRefExp)).to.be.true;
  });

  it("should return true for nested value satisfies predicate", () => {
    expect(some($("main").multiply(2), isRefExp)).to.be.true;
  });

  it("should return false when nothing satisfies predicate", () => {
    const isCountDistinct = (e: Expression) => e instanceof CountDistinctExpression;
    expect(some($("main").multiply(2), isCountDistinct)).to.be.false;
  });
});
