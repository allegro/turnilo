/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { MANIFESTS } from "../../manifests/index";
import { Essence, EssenceJS, EssenceContext } from './essence';
import { DataSourceMock } from "../data-source/data-source.mock";
import { SplitCombineMock } from "../split-combine/split-combine.mock";

export class EssenceMock {
  static wikiTotalsJS(): EssenceJS {
    return {
      visualization: 'totals',
      timezone: 'Etc/UTC',
      pinnedDimensions: [],
      selectedMeasures: [],
      splits: []
    };
  }

  static wikiLineChartJS(): EssenceJS {
    return {
      visualization: 'line-chart',
      timezone: 'Etc/UTC',
      pinnedDimensions: [],
      selectedMeasures: [],
      splits: [SplitCombineMock.TIME_JS]
    };
  }

  static wikiLineChartNoSplitJS(): EssenceJS {
    return {
      visualization: 'line-chart',
      timezone: 'Etc/UTC',
      pinnedDimensions: [],
      selectedMeasures: [],
      splits: []
    };
  }

  static getContext(): EssenceContext {
    return {
      dataSource: DataSourceMock.wiki(),
      visualizations: MANIFESTS
    };
  }

  static wikiTotals() {
    return Essence.fromJS(EssenceMock.wikiTotalsJS(), EssenceMock.getContext());
  }

  static wikiLineChart() {
    return Essence.fromJS(EssenceMock.wikiLineChartJS(), EssenceMock.getContext());
  }

  static wikiLineChartNoSplit() {
    return Essence.fromJS(EssenceMock.wikiLineChartNoSplitJS(), EssenceMock.getContext());
  }
}
