/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { MANIFESTS } from "../../manifests";
import { FilterFixtures } from "../filter/filter.fixtures";
import { Essence, EssenceJS, EssenceContext } from './essence';
import { DataCubeMock } from "../data-cube/data-cube.mock";
import { SplitCombineMock } from "../split-combine/split-combine.mock";

export class EssenceMock {
  static noVisualisationJS(): EssenceJS {
    return {
      visualization: 'totals',
      timezone: 'Etc/UTC',
      pinnedDimensions: [],
      selectedMeasures: [],
      splits: []
    };
  }

  static totalsJS(): EssenceJS {
    return {
      visualization: 'totals',
      timezone: 'Etc/UTC',
      pinnedDimensions: [],
      selectedMeasures: [],
      splits: []
    };
  }

  static lineChartJS(): EssenceJS {
    return {
      visualization: 'line-chart',
      timezone: 'Etc/UTC',
      pinnedDimensions: ['countryIso'],
      selectedMeasures: ['count'],
      filter: FilterFixtures.wikiLanguageIn(["any article"]),
      splits: [SplitCombineMock.TIME_JS]
    };
  }

  static lineChartNoSplitJS(): EssenceJS {
    return {
      visualization: 'line-chart',
      timezone: 'Etc/UTC',
      pinnedDimensions: [],
      selectedMeasures: [],
      splits: []
    };
  }

  static getWikiContext(): EssenceContext {
    return {
      dataCube: DataCubeMock.wiki(),
      visualizations: MANIFESTS
    };
  }

  static getTwitterContext(): EssenceContext {
    return {
      dataCube: DataCubeMock.twitter(),
      visualizations: MANIFESTS
    };
  }

  static wikiTotals() {
    return Essence.fromJS(EssenceMock.totalsJS(), EssenceMock.getWikiContext());
  }

  static wikiLineChart() {
    return Essence.fromJS(EssenceMock.lineChartJS(), EssenceMock.getWikiContext());
  }

  static wikiLineChartNoSplit() {
    return Essence.fromJS(EssenceMock.lineChartNoSplitJS(), EssenceMock.getWikiContext());
  }

  static twitterNoVisualisation() {
    return Essence.fromJS(EssenceMock.noVisualisationJS(), EssenceMock.getTwitterContext());
  }
}
