'use strict';

import React = require("react");
import Icon = require('react-svg-icons');
import { Timezone, WallTime } from "chronology";
import { $, Expression, Datum, Dataset, NativeDataset, basicDispatcherFactory, TimeRange } from 'plywood';

import { Filter, Dimension, Measure, SplitCombine, Clicker } from "./models/index";
import { Application } from "./components/index";

// Init chronology
if (!WallTime.rules) {
  var tzData = require("chronology/lib/walltime/walltime-data.js");
  WallTime.init(tzData.rules, tzData.zones);
}

// Fake data
var wikiRawData: any[] = (<any>window)['wiki_day_data'];
for (let d of wikiRawData) d['time'] = new Date(d['time']);

var wikiData = <NativeDataset>Dataset.fromJS(wikiRawData);
wikiData.introspect();

var attributes = wikiData.attributes;
var dimensions: Dimension[] = [];
var measures: Measure[] = [];

if (!attributes['count']) {
  measures.push(new Measure('count', 'Count', $('main').count()));
}

for (let k in attributes) {
  let type = attributes[k].type;
  switch (type) {
    case 'STRING':
    case 'TIME':
      dimensions.push(new Dimension(k, k, $(k), type));
      break;

    case 'NUMBER':
      measures.push(new Measure(k, k, $('main').sum($(k))));
      break;

    default:
      throw new Error('bad type ' + type);
  }
}
dimensions.sort((a, b) => a.name.localeCompare(b.name));

// Fake data

var basicDispatcher = basicDispatcherFactory({
  datasets: {
    main: wikiData
  }
});

function render() {
  React.render(
    React.createElement(Application, {
      dispatcher: basicDispatcher,
      dimensions: dimensions,
      measures: measures
    }),
    document.body
  );
}
render();

(<any>window)['swapz'] = () => {
  var t = dimensions[0];
  dimensions[0] = dimensions[1];
  dimensions[1] = t;
  render();
};
