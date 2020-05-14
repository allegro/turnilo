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

import { expect, use } from "chai";
import { Stage } from "../../../../common/models/stage/stage";
import equivalent from "../../../utils/test-utils/equivalent";
import { calculateChartStage } from "./calculate-chart-stage";

use(equivalent);

const stage = Stage.fromSize(1000, 800);

describe("calculateChartStage", () => {
  it("should fit one chart into stage with correct padding", () => {
    expect(calculateChartStage(stage, 1)).to.be.equivalent(Stage.fromJS({
      x: 10,
      y: 0,
      width: 980,
      height: 770
    }));
  });

  it("should fit two chart into stage with correct padding", () => {
    expect(calculateChartStage(stage, 2)).to.be.equivalent(Stage.fromJS({
      x: 10,
      y: 0,
      width: 980,
      height: 385
    }));
  });

  it("should respect minimal height for chart", () => {
    expect(calculateChartStage(stage, 10)).to.be.equivalent(Stage.fromJS({
      x: 10,
      y: 0,
      width: 980,
      height: 200
    }));
  });
});
