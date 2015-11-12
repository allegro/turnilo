'use strict';
require('./loader.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
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
    return <div className="loader">
        <SvgIcon svg={require('../../icons/grid-loader.svg')}/>
      </div>;
  }
}
