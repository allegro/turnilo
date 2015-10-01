'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import { Timezone, WallTime } from 'chronoshift';
import { $, Expression, Datum, Dataset, TimeRange, AttributeInfo } from 'plywood';

import { queryUrlExecutorFactory } from './utils/ajax/ajax';
import { Filter, Dimension, Measure, SplitCombine, Clicker, DataSource, DataSourceJS } from '../common/models/index';
import { PivotApplication, PivotApplicationProps } from "./components/index";

export function pivot(container: Element, options: PivotApplicationProps) {
  React.render(
    React.createElement(PivotApplication, options),
    container
  );
}
