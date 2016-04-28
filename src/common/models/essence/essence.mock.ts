import { List } from 'immutable';

import { Essence, EssenceJS, EssenceContext } from './essence';
import { DataSourceMock } from "../data-source/data-source.mock";

export class EssenceMock {
  static wiki() {
    var vis: EssenceJS = {
      visualization: 'vis1',
      timezone: 'Etc/UTC',
      pinnedDimensions: [],
      selectedMeasures: [],
      splits: []
    };

    var context: EssenceContext = {
      dataSource: DataSourceMock.wiki(),
      visualizations: List([
        {
          id: 'vis1',
          title: 'vis1',
          handleCircumstance(): any {
            return { 'isAutomatic': () => false };
          }
        }
      ])
    };

    return Essence.fromJS(vis, context);
  }
}
