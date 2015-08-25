'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import { Timezone, WallTime } from 'chronology';
import { $, Expression, Datum, Dataset, TimeRange, AttributeInfo } from 'plywood';

import { Filter, Dimension, Measure, SplitCombine, Clicker, DataSource } from "./models/index";
import { Application } from "./components/index";

// Init chronology
if (!WallTime.rules) {
  var tzData = require("chronology/lib/walltime/walltime-data.js");
  WallTime.init(tzData.rules, tzData.zones);
}

var dataSources: List<DataSource>;
if ((<any>window)['ds']) {
  var ds: any[] = (<any>window)['ds'];
  dataSources = List(ds.map(d => {
    return DataSource.fromQueryURL(d.name, d.title, '/query', AttributeInfo.fromJSs(d.attributes));
  }));
} else {
  dataSources = List([
    DataSource.fromDataFileURL('wiki_static', 'Static Wikipedia Edits', '/wikipedia.json')
    //DataSource.fromArray('wiki2', 'Wikipedia Edits 2', wikiRawData)
  ]);
}

React.render(
  React.createElement(Application, {
    dataSources: dataSources
  }),
  document.body
);
