'use strict';
require('./loader.css');

import * as React from 'react/addons';
import { SvgIcon } from '../svg-icon/svg-icon';

export interface LoaderProps {
}

export interface LoaderState {
}

export class Loader extends React.Component<LoaderProps, LoaderState> {
  constructor() {
    super();
    // this.state = {};

  }

  render() {
    return JSX(`
      <div className="loader">
        <SvgIcon name="grid-loader"/>
      </div>
    `);
  }
}
