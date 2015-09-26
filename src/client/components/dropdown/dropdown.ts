'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
// import * as Icon from 'react-svg-icons';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../../common/models/index';
// import { ... } from '../../config/constants';
// import { SomeComp } from '../some-comp/some-comp';

// I am: import { Dropdown } from '../dropdown/dropdown';

export interface DropdownProps {
}

export interface DropdownState {
}

export class Dropdown extends React.Component<DropdownProps, DropdownState> {
  public mounted: boolean;

  constructor() {
    super();
    // this.state = {};

  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps: DropdownProps) {

  }

  render() {
    return JSX(`
      <div className="dropdown"></div>
    `);
  }
}
