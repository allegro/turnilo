'use strict';

import { List } from 'immutable';
import { Timezone, WallTime } from 'chronoshift';

import { queryUrlExecutorFactory } from './utils/ajax/ajax';
import { DataSource, DataSourceJS } from '../common/models/index';

import { pivot } from './pivot';

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
  throw new Error('config not found');
}

pivot(document.body, {
  dataSources
});
