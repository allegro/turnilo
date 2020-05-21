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
import { equalProps } from "./equal-props";

const propsMock = {
  propString: "foo",
  propNumber: 42,
  propBoolean: true,
  propObject: {
    bazz: true
  }
};

describe("equalProps", () => {
  it("should return true if all props are the referentially identical", () => {
    const props = propsMock;
    expect(equalProps(props, props)).to.be.true;
  });

  it("should return false if one prop has different reference", () => {
    const oldProps = propsMock;
    const newProps = { ...propsMock, propObject: {} };
    expect(equalProps(oldProps, newProps)).to.be.false;
  });

  it("should return true if one prop has different reference but returns true for equals method", () => {
    const oldProps = { ...propsMock, equalableProp: { equals: () => true } };
    const newProps = { ...propsMock, equalableProp: { equals: () => true } };
    expect(equalProps(oldProps, newProps)).to.be.true;
  });

  it("should return false if one prop has different reference and returns false for equals method", () => {
    const oldProps = { ...propsMock, equalableProp: { equals: () => false } };
    const newProps = { ...propsMock, equalableProp: { equals: () => false } };
    expect(equalProps(oldProps, newProps)).to.be.false;
  });
});
