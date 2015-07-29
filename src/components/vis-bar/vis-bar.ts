'use strict';

import * as React from 'react/addons';
import { $, Expression, Dispatcher, NativeDataset } from 'plywood';
import { Filter, Dimension, Measure } from '../../models/index';
// import { SomeComp } from '../some-comp/some-comp';

interface VisBarProps {
}

interface VisBarState {
}

export class VisBar extends React.Component<VisBarProps, VisBarState> {

  constructor() {
    super();
    // this.state = {};

  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps: VisBarProps) {

  }

  componentWillUnmount() {

  }

  render() {
    return JSX(`
      <div className="vis-bar">Table Lines</div>
    `);
  }
}
