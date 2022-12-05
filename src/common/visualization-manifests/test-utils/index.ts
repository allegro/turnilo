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

import * as Chai from "chai";
import { Essence } from "../../models/essence/essence";
import { EssenceFixtures } from "../../models/essence/essence.fixtures";
import { measureSeries } from "../../models/series/series.fixtures";
import { Visualization } from "../../models/visualization-manifest/visualization-manifest";

export const totals = EssenceFixtures
  .wikiTotals()
  .addSeries(measureSeries("added"));

export function visualizationManifestResolvers(chai: typeof Chai) {
  chai.Assertion.addMethod("resolvedTo", function(visualization: Visualization) {
    const essence = this._obj as Essence;
    this.assert(
      essence.visResolve.state === "ready" && essence.visualization.name === visualization,
      `expected Essence to resolve to ${visualization}`,
      `expected Essence not to resolve to ${visualization}`,
      visualization,
      essence.visualization.name,
      false
    );
  });
}

declare global {
  namespace Chai {
    interface Assertion {
      resolvedTo(visualization: Visualization): Assertion;
    }
  }
}
