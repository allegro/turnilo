require('./pivot-entry.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { addErrorMonitor } from './utils/error-monitor/error-monitor';
import { DataSource, AppSettingsJS } from '../common/models/index';

import { Loader } from './components/loader/loader';

addErrorMonitor();

var container = document.getElementsByClassName('app-container')[0];
if (!container) throw new Error('container not found');

// Add the loader
ReactDOM.render(
  React.createElement(Loader),
  container
);

interface Config {
  version: string;
  user: any;
  appSettings: AppSettingsJS;
  readOnly: boolean;
}

var config: Config = (window as any)['__CONFIG__'];
if (!config || !config.version || !config.appSettings || !config.appSettings.dataSources) {
  throw new Error('config not found');
}

if (config.appSettings.dataSources.length) {
  var version = config.version;

  require.ensure([
    'chronoshift',
    'chronoshift/lib/walltime/walltime-data.js',
    './utils/ajax/ajax',
    '../common/models/index',
    '../common/manifests/index',
    './views/pivot-application/pivot-application'
  ], (require) => {
    const WallTime = require('chronoshift').WallTime;
    const queryUrlExecutorFactory = require('./utils/ajax/ajax').queryUrlExecutorFactory;
    const AppSettings = require('../common/models/index').AppSettings;
    const MANIFESTS = require('../common/manifests/index').MANIFESTS;
    const PivotApplication = require('./views/pivot-application/pivot-application').PivotApplication;

    var appSettings = AppSettings.fromJS(config.appSettings, {
      visualizations: MANIFESTS
    }).attachExecutors((dataSource: DataSource) => {
      return queryUrlExecutorFactory(dataSource.name, 'plywood', version);
    });

    // Init chronoshift
    if (!WallTime.rules) {
      var tzData = require('chronoshift/lib/walltime/walltime-data.js');
      WallTime.init(tzData.rules, tzData.zones);
    }

    ReactDOM.render(
      React.createElement(
        PivotApplication,
        {
          version,
          user: config.user,
          appSettings,
          readOnly: config.readOnly
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
  require.ensure(['../../lib/polyfill/ios-drag-drop.js'], (require) => {
    require('../../lib/polyfill/ios-drag-drop.js');
  }, 'ios-drag-drop');
}
