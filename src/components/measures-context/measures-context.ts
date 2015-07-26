'use strict';

import React = require('react/addons');
import { $, Expression, Dispatcher, NativeDataset } from 'plywood';
import { Filter, Dimension, Measure } from '../../models/index';
// import { SomeComp } from '../some-comp/some-comp';

interface MeasuresContextProps {
}

interface MeasuresContextState {
}

export class MeasuresContext extends React.Component<MeasuresContextProps, MeasuresContextState> {

  constructor() {
    super();
    // this.state = {};

  }

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  componentWillReceiveProps(nextProps: MeasuresContextProps) {

  }

  render() {
    return JSX(`
      <div className="measures-context"></div>
    `);
  }
}
