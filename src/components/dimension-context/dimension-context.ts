'use strict';

import React = require('react/addons');
import { $, Expression, Dispatcher, NativeDataset } from 'plywood';
import { Filter, Dimension, Measure } from '../../models/index';
// import { SomeComp } from '../some-comp/some-comp';

interface DimensionContextProps {
}

interface DimensionContextState {
}

export class DimensionContext extends React.Component<DimensionContextProps, DimensionContextState> {

  constructor() {
    super();
    // this.state = {};

  }

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  componentWillReceiveProps(nextProps: DimensionContextProps) {

  }

  render() {
    return JSX(`
      <div className="dimension-context"></div>
    `);
  }
}
