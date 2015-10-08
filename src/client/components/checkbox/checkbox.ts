'use strict';
require('./checkbox.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Filter, Dimension, Measure } from '../../../common/models/index';
// import { SomeComp } from '../some-comp/some-comp';

export interface CheckboxProps {
  checked: Boolean;
  onClick?: Function;
}

export interface CheckboxState {
}

export class Checkbox extends React.Component<CheckboxProps, CheckboxState> {

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    var { checked, onClick } = this.props;

    var check: React.ReactElement<any> = null;
    if (checked) {
      check = React.createElement(SvgIcon, {
        name: "check"
      });
    }

    return JSX(`
      <div className={'checkbox' + (checked ? ' checked' : '')} onClick={onClick}>{check}</div>
    `);
  }
}
