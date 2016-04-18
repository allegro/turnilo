require('./pivot-entry.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { addErrorMonitor } from './utils/error-monitor/error-monitor';
import { DataSourceJS, CustomizationJS } from '../common/models/index';

import { Loader } from './components/loader/loader';

addErrorMonitor();

var container = document.getElementsByClassName('app-container')[0];
if (!container) throw new Error('container not found');

// Add the loader
ReactDOM.render(
  React.createElement(Loader),
  container
);

var config: any = (window as any)['__CONFIG__'];
if (!config || !Array.isArray(config.dataSources)) throw new Error('config not found');

if (config.dataSources.length) {
  var version = config.version || '0.0.0';

  require.ensure([
    'immutable',
    'chronoshift',
    'chronoshift/lib/walltime/walltime-data.js',
    './utils/ajax/ajax',
    '../common/models/index',
    './components/pivot-application/pivot-application'
  ], (require) => {
    var List = require('immutable').List;
    var WallTime = require('chronoshift').WallTime;
    var queryUrlExecutorFactory = require('./utils/ajax/ajax').queryUrlExecutorFactory;
    var DataSource = require('../common/models/index').DataSource;
    var Customization = require('../common/models/index').Customization;
    var PivotApplication = require('./components/pivot-application/pivot-application').PivotApplication;

    // Init chronoshift
    if (!WallTime.rules) {
      var tzData = require('chronoshift/lib/walltime/walltime-data.js');
      WallTime.init(tzData.rules, tzData.zones);
    }

    var dataSources = List(config.dataSources.map((dataSourceJS: DataSourceJS) => {
      var executor = queryUrlExecutorFactory(dataSourceJS.name, '/plywood', version);
      return DataSource.fromJS(dataSourceJS, { executor });
    }));

    ReactDOM.render(
      React.createElement(
        PivotApplication,
        {
          version,
          user: config.user,
          dataSources,
          linkViewConfig: config.linkViewConfig,
          customization: Customization.fromJS(config.customization) || null
        }
      ),
      container
    );
  }, 'pivot-main');

} else {
  require.ensure([
    './components/no-data-sources-application/no-data-sources-application'
  ], (require) => {
    var NoDataSourcesApplication = require('./components/no-data-sources-application/no-data-sources-application').NoDataSourcesApplication;

    ReactDOM.render(
      React.createElement(NoDataSourcesApplication, {}),
      container
    );
  }, 'no-data-sources');
}


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
