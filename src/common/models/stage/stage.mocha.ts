/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { testImmutableClass } from "immutable-class-tester";

import { Stage, StageJS } from "./stage";
import { StageFixtures } from "./stage.fixtures";

describe("Stage", () => {
  it("is an immutable class", () => {
    testImmutableClass<StageJS>(Stage, [
      StageFixtures.DEFAULT_A_JS,
      StageFixtures.DEFAULT_B_JS,
      StageFixtures.DEFAULT_C_JS
    ]);
  });

});
