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

import { assertEqlEssence } from "../../test/assertions";
import { mockEssence } from "../../test/essence.fixture";
import { mockViewDefinition } from "../../test/view-definition.fixture";
import { ViewDefinitionConverter4 } from "../view-definition-converter-4";
import { toEssence } from "./utils";

describe("ViewDefinitionConverter4", () => {
  describe("Base case", () => {
    it("converts base view definition mock to base essence mock", () => {
      const result = toEssence(mockViewDefinition());
      const expected = mockEssence();
      assertEqlEssence(result, expected);
    });
  });
});
