'use strict';

import React = require("react");
import Icon = require('react-svg-icons');
import { Timezone, WallTime } from "chronology";
import { $, Expression, Datum, Dataset, NativeDataset, TimeRange } from 'plywood';

import { Filter, Dimension, Measure, SplitCombine, Clicker, DataSource } from "./models/index";
import { Application } from "./components/index";

// Init chronology
if (!WallTime.rules) {
  var tzData = require("chronology/lib/walltime/walltime-data.js");
  WallTime.init(tzData.rules, tzData.zones);
}

// Fake data
var wikiRawData: any[] = (<any>window)['wiki_day_data'];
for (let d of wikiRawData) d['time'] = new Date(d['time']);

var dataSources = [
  DataSource.fromNativeDataset('Wikipedia', wikiRawData),
  DataSource.fromNativeDataset('Wikipedia 2', wikiRawData)
];

function render() {
  React.render(
    React.createElement(Application, {
      dataSources: dataSources
    }),
    document.body
  );
}
render();
