require('./no-data-sources-entry.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { NoDataSourcesApplication } from "./components/no-data-sources-application/no-data-sources-application";

var container = document.getElementsByClassName('app-container')[0];
if (container) {
  ReactDOM.render(
    React.createElement(NoDataSourcesApplication, {}),
    container
  );
}
