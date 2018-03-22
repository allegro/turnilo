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
import { MANIFESTS } from "../../manifests";
import { DataCubeMock } from "../../models/data-cube/data-cube.mock";
import { EssenceMock } from "../../models/essence/essence.mock";
import { ViewDefinitionVersion } from "../../view-definitions";
import { UrlHashConverter } from "./url-hash-converter";

describe("UrlHashConverter", () => {
  const urlHashConverter = new UrlHashConverter();

  const versions: ViewDefinitionVersion[] = ["2", "3"];

  versions.forEach((version) => {
    it(`is symmetric for version: ${version}`, () => {
      var essenceIn = EssenceMock.wikiLineChart();

      var hash = urlHashConverter.toHash(essenceIn);
      var essenceOut = urlHashConverter.essenceFromHash(hash, DataCubeMock.wiki(), MANIFESTS);

      expect(essenceIn.toJS()).to.deep.equal(essenceOut.toJS());
    });
  });
});
