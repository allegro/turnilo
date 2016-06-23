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
