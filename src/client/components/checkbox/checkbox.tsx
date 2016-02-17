'use strict';
require('./checkbox.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Filter, Dimension, Measure } from '../../../common/models/index';
// import { SomeComp } from '../some-comp/some-comp';

export interface CheckboxProps extends React.Props<any> {
  selected: Boolean;
  onClick?: React.MouseEventHandler;
  cross?: Boolean;
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
    var { selected, onClick, cross, color } = this.props;

    var className = 'checkbox';

    var style: React.CSSProperties = null;
    if (color) {
      className += ' color';
      style = { background: color };
    }

    var check: JSX.Element = null;

    if (selected) {
      if (cross) {
        className += ' cross';
        check = <SvgIcon svg={require('../../icons/x.svg')}/>;
      } else {
        className += ' check';
        check = <SvgIcon svg={require('../../icons/check.svg')}/>;
      }
    }

    return <div className={className} onClick={onClick}>
      <div className="checkbox-body" style={style}></div>
      {check}
    </div>;
  }
}
