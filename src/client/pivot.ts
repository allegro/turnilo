'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import { Timezone, WallTime } from 'chronoshift';
import { $, Expression, Datum, Dataset, TimeRange, AttributeInfo } from 'plywood';

import { queryUrlExecutorFactory } from './utils/executors';
import { Filter, Dimension, Measure, SplitCombine, Clicker, DataSource } from "./models/index";
import { PivotApplication } from "./components/index";

// Init chronoshift
if (!WallTime.rules) {
  var tzData = require("chronoshift/lib/walltime/walltime-data.js");
  WallTime.init(tzData.rules, tzData.zones);
}

var globalDataSources: any[] = (<any>window)['PIVOT_DATA_SOURCES'];

var dataSources: List<DataSource>;
if (Array.isArray(globalDataSources)) {
  dataSources = List(globalDataSources.map(d => {
    var executor = queryUrlExecutorFactory(d.name, '/query');
    return DataSource.fromJS(d, executor);
  }));
} else {
  // Assume test / demo
  dataSources = List([
    DataSource.fromDataFileURL('static-wiki-file', 'Static Wikipedia Edits', '/wikipedia.json', new Date())
  ]);
}

React.render(
  React.createElement(PivotApplication, {
    dataSources: dataSources
  }),
  document.body
);
