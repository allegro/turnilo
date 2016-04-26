require('./drop-indicator.css');

import * as React from 'react';
import { SvgIcon } from '../svg-icon/svg-icon';

export interface DropIndicatorProps extends React.Props<any> {
}

export interface DropIndicatorState {
}

export class DropIndicator extends React.Component<DropIndicatorProps, DropIndicatorState> {

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    return <div className="drop-indicator">
      <div className="white-out"></div>
      <div className="action">
        <SvgIcon svg={require('../../icons/split-replace.svg')}/>
      </div>
    </div>;
  }
}
