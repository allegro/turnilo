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

import { scaleLinear } from "@visx/scale";
import { expect } from "chai";
import getHoverPosition from "./get-hover-position";

const xScale = scaleLinear({ domain: [0, 10], range: [0, 100] });
const yScale = scaleLinear({ domain: [10, 0], range: [200, 0] });

describe("getHoverPosition", () => {
  it("should return null outside of body", () => {
    expect(getHoverPosition(xScale, yScale, 0, 0, "left-gutter", {} as any)).to.be.null;
    expect(getHoverPosition(xScale, yScale, 0, 0, "top-gutter", {} as any)).to.be.null;
    expect(getHoverPosition(xScale, yScale, 0, 0, "top-right-corner", {} as any)).to.be.null;
  });

  it("should return null of x is outside of heatmap width", () => {
    expect(getHoverPosition(xScale, yScale, 20000, 123, "body", { left: 10, top: 20 } as any)).to.be.null;
  });

  it("should return null of y is outside of heatmap height", () => {
    expect(getHoverPosition(xScale, yScale, 42, 20000, "body", { left: 10, top: 20 } as any)).to.be.null;
  });

  it("should pass through x and y as left and top", () => {
    expect(getHoverPosition(xScale, yScale, 42, 123, "body", {} as any)).to.include({
      left: 42,
      top: 123
    });
  });

  it("should pass calculate row and column", () => {
    expect(getHoverPosition(xScale, yScale, 42, 123, "body", { left: 10, top: 20 } as any)).to.include({
      row: 5,
      column: 3
    });
  });
});
