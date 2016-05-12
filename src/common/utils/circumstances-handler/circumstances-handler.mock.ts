import { CircumstancesHandler } from './circumstances-handler';

import { r, $, ply, Executor, Expression, Dataset, Datum, TimeRange, TimeRangeJS, TimeBucketAction, SortAction } from 'plywood';
import { Dimension, Essence, Splits, SplitCombine, Filter, FilterClause, Measure, DataSource, Resolve, Resolution, Colors } from '../../models/index';

export class CircumstancesHandlerMock {
  static alwaysManual(): CircumstancesHandler {
    return CircumstancesHandler.EMPTY()
      .otherwise(() => {
        return Resolve.manual(7, 'Manual resolve is the _best_ resolve', [{
          description: '¡ Hola !',
          adjustment: {
            splits: Splits.EMPTY
          }
        }]);
      });
  }
}
