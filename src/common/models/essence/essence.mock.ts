import { List } from 'immutable';

import { CircumstancesHandlerMock } from '../../utils/circumstances-handler/circumstances-handler.mock';

import { Essence, EssenceJS, EssenceContext } from './essence';
import { DataSourceMock } from "../data-source/data-source.mock";
import { SplitCombineMock } from "../split-combine/split-combine.mock";

export class EssenceMock {
  static wiki() {
    var vis: EssenceJS = {
      visualization: 'vis1',
      timezone: 'Etc/UTC',
      pinnedDimensions: [],
      selectedMeasures: [],
      splits: [SplitCombineMock.TIME_JS]
    };

    var context: EssenceContext = {
      dataSource: DataSourceMock.wiki(),
      visualizations: List([
        {
          id: 'vis1',
          title: 'vis1',
          handleCircumstance(): any {
            let handler = CircumstancesHandlerMock.alwaysManual();
            return handler.evaluate.apply(handler, arguments);
          }
        }
      ])
    };

    return Essence.fromJS(vis, context);
  }
}
