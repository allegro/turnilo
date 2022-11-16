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
import { twitterDataCube, wikiDataCube } from "../data-cube/data-cube.fixtures";
import { deleteDataCube } from "./sources";
import { wikiTwitterSources } from "./sources.fixtures";

describe("Sources", () => {
  describe("deleteDataCube", () => {
    it("should remove data cube by name", () => {
      const modifiedSources = deleteDataCube(wikiTwitterSources, wikiDataCube);
      expect(modifiedSources.dataCubes).to.be.deep.equal([twitterDataCube]);
    });

    it("should preserve rest of sources fields", () => {
      const sources = wikiTwitterSources;
      const { dataCubes: sourceDataCubes, ...expectedRest } = sources;
      const { dataCubes: modifiedDataCubes, ...modifiedRest } = deleteDataCube(sources, wikiDataCube);

      expect(modifiedRest).to.be.deep.equal(expectedRest);
    });
  });
});
