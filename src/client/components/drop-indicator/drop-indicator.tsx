'use strict';
require('./drop-indicator.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Filter, Dimension, Measure } from '../../../common/models/index';
// import { SomeComp } from '../some-comp/some-comp';

export interface DropIndicatorProps {
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
