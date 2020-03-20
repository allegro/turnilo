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
import { dataset } from "./datum-fixtures";
import scrollerLayout from "./scroller-layout";

describe("scrollerLayout", () => {
  it("should return right prop equal to 0", () => {
    expect(scrollerLayout(dataset, 42, 123)).to.include({ right: 0 });
  });

  it("should return bottom prop equal to 0", () => {
    expect(scrollerLayout(dataset, 42, 123)).to.include({ bottom: 0 });
  });

  it("should return bodyHeight prop proportional to rows count", () => {
    expect(scrollerLayout(dataset, 42, 123)).to.include({ bodyHeight: 100 });
  });

  it("should return bodyWidth prop proportional to columns count", () => {
    expect(scrollerLayout(dataset, 42, 123)).to.include({ bodyWidth: 150 });
  });

  describe("top property", () => {
    it("should be not less than 100", () => {
      expect(scrollerLayout(dataset, 0, 123)).to.include({ top: 100 });
    });

    it("should be not less than 150", () => {
      expect(scrollerLayout(dataset, 500, 123)).to.include({ top: 150 });
    });

    it("should be passed as is if is between 100 and 150", () => {
      expect(scrollerLayout(dataset, 135, 123)).to.include({ top: 135 });
    });
  });

  describe("left property", () => {
    it("should be not less than 100", () => {
      expect(scrollerLayout(dataset, 42, 0)).to.include({ left: 100 });
    });

    it("should be not less than 200", () => {
      expect(scrollerLayout(dataset, 42, 1000)).to.include({ left: 200 });
    });

    it("should be passed as is if is between 100 and 200", () => {
      expect(scrollerLayout(dataset, 42, 174)).to.include({ left: 174 });
    });
  });
});
