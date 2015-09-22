'use strict';

import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';

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
        <Icon name="grid-loader"/>
      </div>
    `);
  }
}
