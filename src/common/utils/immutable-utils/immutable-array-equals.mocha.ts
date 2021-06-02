/*
 * Copyright 2017-2021 Allegro.pl
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
import immutableArrayEquals from "./immutable-array-equals";

interface DummyValue {
  dummy: number;
}

class DummyRecord extends Record<DummyValue>({ dummy: 1 }) {
}

const dummy = (dummy: number) => new DummyRecord({ dummy });

describe("ImmutableArrayEquals", () => {
  it("should return true for both undefined", () => {
    expect(immutableArrayEquals(undefined, undefined)).to.be.true;
  });

  it("should return false for one undefined", () => {
    expect(immutableArrayEquals(undefined, [])).to.be.false;
    expect(immutableArrayEquals([], undefined)).to.be.false;
  });

  it("should return false if length is different", () => {
    expect(immutableArrayEquals([], [dummy(1)])).to.be.false;
    expect(immutableArrayEquals([dummy(1)], [])).to.be.false;
  });

  it("should return false if one member is different", () => {
    expect(immutableArrayEquals([dummy(1), dummy(1)], [dummy(1), dummy(2)])).to.be.false;
  });
});
