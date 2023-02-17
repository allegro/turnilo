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

import { TimeShift } from "../../../models/time-shift/time-shift";
import { mockEssence } from "../../test/essence.fixture";
import { mockViewDefinition } from "../../test/view-definition.fixture";
import { assertConversionToEssence } from "./utils";

describe("TimeShift", () => {
  it("defaults to empty time shift when no time shift given", () => {
    assertConversionToEssence(
      // not really mocks
      mockViewDefinition({ timeShift: undefined }),
      mockEssence({ timeShift: TimeShift.empty() }));
  });

  it.skip("reads time shift from duration string", () => {
    // TODO: timeshift comparison doesn't work because of incompatibility between immutable.equal and imply libs insisting on overriting valueOf
    assertConversionToEssence(
      mockViewDefinition({ timeShift: "P3D" }),
      mockEssence({ timeShift: TimeShift.fromJS("P3D") }));
  });

  it("constrains to empty if shifted period overlaps with time filter period", () => {
    assertConversionToEssence(
      mockViewDefinition({ timeShift: "PT3H" }),
      mockEssence({ timeShift: TimeShift.empty() }));
  });
});
