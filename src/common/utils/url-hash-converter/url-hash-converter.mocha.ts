/*
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

import { expect } from "chai";
import { clientAppSettings } from "../../models/app-settings/app-settings.fixtures";
import { wikiClientDataCube } from "../../models/data-cube/data-cube.fixtures";
import { Essence } from "../../models/essence/essence";
import { EssenceFixtures } from "../../models/essence/essence.fixtures";
import { ViewDefinitionVersion } from "../../view-definitions";
import { hashToObject } from "../../view-definitions/hash-conversions";
import { getHashSegments, urlHashConverter } from "./url-hash-converter";
import { UrlHashConverterFixtures } from "./url-hash-converter.fixtures";

interface HashEssenceCase {
  version: ViewDefinitionVersion;
  hash: string;
  essence: Essence;
}

describe("urlHashConverter", () => {

  describe("version 2", () => {
    const ver2: HashEssenceCase[] = [
      { version: "2", hash: UrlHashConverterFixtures.tableHashVersion2(), essence: EssenceFixtures.wikiTable() },
      { version: "2", hash: UrlHashConverterFixtures.lineChartVersion2(), essence: EssenceFixtures.wikiLineChart() }
    ];

    ver2.forEach(({ version, hash, essence }) => {
      const { visualization } = essence;

      it(`decodes ${visualization.name} version ${version} correctly`, () => {
        const decodedEssence = urlHashConverter.essenceFromHash(hash, clientAppSettings, wikiClientDataCube);

        expect(decodedEssence.toJS()).to.deep.equal(essence.toJS());
      });
    });
  });

  describe("version 3", () => {
    const ver3: HashEssenceCase[] = [
      { version: "3", hash: UrlHashConverterFixtures.tableHashVersion3(), essence: EssenceFixtures.wikiTable() },
      { version: "3", hash: UrlHashConverterFixtures.lineChartVersion3(), essence: EssenceFixtures.wikiLineChart() }
    ];

    ver3.forEach(({ version, hash, essence }) => {
      const { visualization } = essence;

      it(`decodes ${visualization.name} version ${version} correctly`, () => {
        const decodedEssence = urlHashConverter.essenceFromHash(hash, clientAppSettings, wikiClientDataCube);

        expect(decodedEssence.toJS()).to.deep.equal(essence.toJS());
      });
    });
  });

  describe("version 4", () => {
    const ver4: HashEssenceCase[] = [
      { version: "4", hash: UrlHashConverterFixtures.tableHashVersion4(), essence: EssenceFixtures.wikiTable() },
      { version: "4", hash: UrlHashConverterFixtures.lineChartVersion4(), essence: EssenceFixtures.wikiLineChart() }
    ];

    ver4.forEach(({ version, hash, essence }) => {
      const { visualization } = essence;

      it(`decodes ${visualization.name} version ${version} correctly`, () => {
        const decodedEssence = urlHashConverter.essenceFromHash(hash, clientAppSettings, wikiClientDataCube);

        expect(decodedEssence.toJS()).to.deep.equal(essence.toJS());
      });

      it(`is symmetric in decode/encode for ${visualization.name} in version ${version}`, () => {
        const encodedHash = urlHashConverter.toHash(essence, version);
        const decodedEssence = urlHashConverter.essenceFromHash(encodedHash, clientAppSettings, wikiClientDataCube);

        expect(essence.toJS()).to.deep.equal(decodedEssence.toJS());
      });

      function decodeHash(hash: string): object {
        const { encodedModel } = getHashSegments(hash);
        return hashToObject(encodedModel);
      }

      it(`is symmetric in encode/decode for ${visualization.name} in version ${version}`, () => {
        const decodedEssence = urlHashConverter.essenceFromHash(hash, clientAppSettings, wikiClientDataCube);
        const encodedHash = urlHashConverter.toHash(decodedEssence, version);

        try {
          expect(encodedHash).to.equal(hash);
        } catch (e) {
          // rethrow assertion on decoded hashes for readability
          // expect(decodeHash(encodedHash), "decoded hashes").to.deep.equal(decodeHash(hash));
          // if test fails but expect on decoded succeeds (error in test definition) rethrow original assertion exception.
          throw e;
        }
      });
    });
  });

  const minimalNumberOfSegmentsTests: Array<{ version: ViewDefinitionVersion, hash: string }> = [
    { version: "2", hash: UrlHashConverterFixtures.noSlashInEncodedDefinition2() },
    { version: "3", hash: UrlHashConverterFixtures.noSlashInEncodedDefinition3() }
  ];

  minimalNumberOfSegmentsTests.forEach(({ version, hash }) => {
    it(`decodes version ${version} with minimal number of segments`, () => {
      const decodedEssence = urlHashConverter.essenceFromHash(hash, clientAppSettings, wikiClientDataCube);

      expect(decodedEssence).to.be.an.instanceOf(Essence);
    });
  });

  const wrongHashStructureTests = [
    { hash: "table/2", errorMessage: "Unsupported url hash: table/2" },
    { hash: "xxyz", errorMessage: "Expected 2 hash segments, got 1." },
    { hash: "3", errorMessage: "Expected 2 hash segments, got 1." },
    { hash: "3/AAAAA", errorMessage: "Unexpected end of JSON input" }
  ];

  wrongHashStructureTests.forEach(({ hash, errorMessage }) => {
    it(`throws error for hash: "${hash}" with wrong structure`, () => {
      const essenceFromHashCall = () => urlHashConverter.essenceFromHash(hash, clientAppSettings, wikiClientDataCube);
      expect(essenceFromHashCall).to.throw(errorMessage);
    });
  });
});
