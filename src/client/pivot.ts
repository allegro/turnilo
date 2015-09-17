'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import { Timezone, WallTime } from 'chronoshift';
import { $, Expression, Datum, Dataset, TimeRange, AttributeInfo } from 'plywood';

import { queryUrlExecutorFactory } from './utils/ajax/ajax';
import { Filter, Dimension, Measure, SplitCombine, Clicker, DataSource, DataSourceJS } from "./models/index";
import { PivotApplication } from "./components/index";

// Init chronoshift
if (!WallTime.rules) {
  var tzData = require("chronoshift/lib/walltime/walltime-data.js");
  WallTime.init(tzData.rules, tzData.zones);
}

var config: any = (<any>window)['PIVOT_CONFIG'];

var dataSources: List<DataSource>;
if (config && Array.isArray(config.dataSources)) {
  dataSources = <List<DataSource>>List(config.dataSources.map((dataSourceJS: DataSourceJS) => {
    var executor = queryUrlExecutorFactory(dataSourceJS.name, '/query');
    return DataSource.fromJS(dataSourceJS, executor);
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
