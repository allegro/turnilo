'use strict';

import { List } from 'immutable';
import { Manifest } from '../models/index';

import { Totals } from './totals/totals';
import { NestedTable } from './nested-table/nested-table';
import { TimeSeries } from './time-series/time-series';

export var visualizations: List<Manifest> = List([
  Totals,
  NestedTable,
  TimeSeries
]);
