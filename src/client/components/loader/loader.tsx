require('./loader.css');

import * as React from 'react';
import { SvgIcon } from '../svg-icon/svg-icon';

export interface LoaderProps extends React.Props<any> {
}

export interface LoaderState {
}

export class Loader extends React.Component<LoaderProps, LoaderState> {
  constructor() {
    super();

  }

  render() {
    return <div className="loader">
      <SvgIcon svg={require('../../icons/grid-loader.svg')}/>
    </div>;
  }
}
