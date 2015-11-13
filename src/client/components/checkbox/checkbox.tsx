import MouseEventHandler = __React.MouseEventHandler;
'use strict';
require('./checkbox.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Filter, Dimension, Measure } from '../../../common/models/index';
// import { SomeComp } from '../some-comp/some-comp';

export interface CheckboxProps extends React.Props<any> {
  checked: Boolean;
  onClick?: MouseEventHandler;
  color?: string;
}

export interface CheckboxState {
}

export class Checkbox extends React.Component<CheckboxProps, CheckboxState> {

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    var { checked, onClick, color } = this.props;

    var style: React.CSSProperties = null;
    var check: JSX.Element = null;
    if (color) {
      style = { background: color };
    } else if (checked) {
      check = <SvgIcon svg={require('../../icons/check.svg')}/>;
    }

    return <div className={'checkbox' + (checked ? ' checked' : '')} onClick={onClick}>
      <div className="checkbox-body" style={style}></div>
      {check}
    </div>;
  }
}
