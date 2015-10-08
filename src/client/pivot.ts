'use strict';
require('./pivot.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Timezone, WallTime } from 'chronoshift';
import { $, Expression, Datum, Dataset, TimeRange, AttributeInfo } from 'plywood';

import { queryUrlExecutorFactory } from './utils/ajax/ajax';
import { Filter, Dimension, Measure, SplitCombine, Clicker, DataSource, DataSourceJS } from '../common/models/index';
import { PivotApplication, PivotApplicationProps } from "./components/index";

// Polyfill
// from https://github.com/reppners/ios-html5-drag-drop-shim/tree/effectAllowed_dropEffect
// /polyfill/mobile-drag-and-drop-polyfill/mobile-drag-and-drop-polyfill.js

require.ensure(['../../assets/polyfill/ios-drag-drop.js'], (require) => {
  require('../../assets/polyfill/ios-drag-drop.js');
}, 'polyfill');

export function pivot(container: Element, options: PivotApplicationProps) {
  var cont = document.getElementsByClassName('pivot-container')[0];
  if (!cont) return;
  ReactDOM.render(React.createElement(PivotApplication, options), cont);
}
