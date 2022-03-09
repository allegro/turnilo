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
import { Stage } from "../../../../common/models/stage/stage";
import { extendExtentIfNeeded, getTicksForAvailableSpace, getXAxisLabelPosition } from "./get-plotting-data";

describe("extendExtentIfNeeded", () => {
  it("should extend when min and max are the same", () => {
    const extent = [10, 10];

    const result = extendExtentIfNeeded(extent);

    expect(result).to.eql([9.5, 10.5]);
  });

  it("should not extend when min and max differ", () => {
    const extent = [10, 100];

    const result = extendExtentIfNeeded(extent);

    expect(result).to.eql([10, 100]);
  });
});

describe("getTicksForAvailableSpace", () => {
  it("should return not changed ticks when available space is more than 768px", () => {
    const ticks = [10, 20, 30, 40, 50];

    const result = getTicksForAvailableSpace(ticks, 1024);

    expect(result).to.eql([10, 20, 30, 40, 50]);
  });

  it("should filter ticks at even indexes when available space is less than 768px", () => {
    const ticks = [10, 20, 30, 40, 50];

    const result = getTicksForAvailableSpace(ticks, 544);

    expect(result).to.eql([10, 30, 50]);
  });
});

describe("getXAxisLabelPosition", () => {
  it("should return bottom and right position", () => {
    const stage = Stage.fromJS({
      x: 0, y: 0, width: 1000, height: 800
    });
    const plottingStage = Stage.fromJS({
      x: 100, y: 100, width: 800, height: 600
    });

    const result = getXAxisLabelPosition(stage, plottingStage);

    expect(result).to.eql({ bottom: 155, right: 100 });
  });
});
