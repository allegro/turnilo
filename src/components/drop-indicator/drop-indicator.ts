'use strict';

import React = require('react');
import { $, Expression, Dispatcher, NativeDataset } from 'plywood';
import { Filter, Dimension, Measure } from '../../models/index';
// import { SomeComp } from '../some-comp/some-comp';

interface DropIndicatorProps {
}

interface DropIndicatorState {
}

export class DropIndicator extends React.Component<DropIndicatorProps, DropIndicatorState> {

  constructor() {
    super();
    // this.state = {};

  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps: DropIndicatorProps) {

  }

  componentWillUnmount() {

  }

  render() {
    return JSX(`
      <div className="drop-indicator">
        <div className="white-out"></div>
        <div className="actions">
          <div className="replace-split action">Full view</div>
          <div className="add-split action">Add split</div>
        </div>
      </div>
    `);
  }
}
