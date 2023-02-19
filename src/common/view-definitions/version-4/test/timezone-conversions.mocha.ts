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

import { Timezone } from "chronoshift";
import { mockEssence } from "../../test/essence.fixture";
import { mockViewDefinition } from "../../test/view-definition.fixture";
import { assertConversionToEssence } from "./utils";

describe("Timezone", () => {
  it("reads UTC timezone from string", () => {
    assertConversionToEssence(
      mockViewDefinition({ timezone: "Etc/UTC" }),
      mockEssence({ timezone: Timezone.UTC }));
  });

  it("reads Europe/Warsaw timezone from string", () => {
    assertConversionToEssence(
      mockViewDefinition({ timezone: "Europe/Warsaw" }),
      mockEssence({ timezone: Timezone.fromJS("Europe/Warsaw") }));
  });

  it.skip("defaults to UTC timezone for non recognized timezone", () => {
    assertConversionToEssence(
      mockViewDefinition({ timezone: "Foobar/Qvux" }),
      mockEssence({ timezone: Timezone.UTC }));
  });

  it.skip("defaults to UTC timezone", () => {
    assertConversionToEssence(
      mockViewDefinition({ timezone: null }),
      mockEssence({ timezone: Timezone.UTC }));
  });
});
