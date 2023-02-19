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

import { Visualization, VisualizationManifest } from "../../../models/visualization-manifest/visualization-manifest";
import { ImmutableRecord } from "../../../utils/immutable-utils/immutable-utils";
import { TABLE_MANIFEST } from "../../../visualization-manifests/table/table";
import { TOTALS_MANIFEST } from "../../../visualization-manifests/totals/totals";
import { mockEssence } from "../../test/essence.fixture";
import { mockViewDefinition } from "../../test/view-definition.fixture";
import { assertConversionToEssence } from "./utils";

describe("Visualization", () => {
  const mockViewDefinitionWithVis = (visualization: Visualization, visualizationSettings: object | null = null) =>
    mockViewDefinition({ visualization, visualizationSettings });

  const mockEssenceWithVis = (visualization: VisualizationManifest, visualizationSettings: ImmutableRecord<object> | null = null) =>
    mockEssence({ visualization, visualizationSettings });

  describe("Totals", () => {
    it("reads totals visualization", () => {
      assertConversionToEssence(
        mockViewDefinitionWithVis("totals"),
        mockEssenceWithVis(TOTALS_MANIFEST));
    });
  });

  describe("Table", () => {
    const manifest = TABLE_MANIFEST as any as VisualizationManifest;

    it("reads table visualization and use default settings", () => {
      assertConversionToEssence(
        mockViewDefinitionWithVis("table"),
        mockEssenceWithVis(manifest, manifest.visualizationSettings.defaults));
    });

    it("reads table visualization and converts settings", () => {
      const settings = { collapseRows: true };
      const convertedSettings = manifest.visualizationSettings.converter.read(settings);
      assertConversionToEssence(
        mockViewDefinitionWithVis("table", settings),
        mockEssenceWithVis(manifest, convertedSettings));
    });
  });

});
