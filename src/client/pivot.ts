'use strict';
require('./pivot.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Timezone, WallTime } from 'chronoshift';
import { $, Expression, Datum, Dataset, TimeRange, AttributeInfo } from 'plywood';

import { Filter, Dimension, Measure, SplitCombine, DataSource, DataSourceJS } from '../common/models/index';
import { PivotApplication, PivotApplicationProps } from "./components/pivot-application/pivot-application";

// Polyfill
// from https://github.com/reppners/ios-html5-drag-drop-shim/tree/effectAllowed_dropEffect
// /polyfill/mobile-drag-and-drop-polyfill/mobile-drag-and-drop-polyfill.js

// From ../../assets/polyfill/ios-drag-drop.js
var div = document.createElement('div');
var dragDiv = 'draggable' in div;
var evts = 'ondragstart' in div && 'ondrop' in div;

var needsPatch = !(dragDiv || evts) || /iPad|iPhone|iPod|Android/.test(navigator.userAgent);

if (needsPatch) {
  require.ensure(['../../assets/polyfill/ios-drag-drop.js'], (require) => {
    require('../../assets/polyfill/ios-drag-drop.js');
  }, 'ios-drag-drop');
}

export function pivot(container: Element, options: PivotApplicationProps) {
  var cont = document.getElementsByClassName('pivot-container')[0];
  if (!cont) return;
  return ReactDOM.render(React.createElement(PivotApplication, options), cont);
}
