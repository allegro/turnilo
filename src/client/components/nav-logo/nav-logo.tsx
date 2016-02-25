require('./nav-logo.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure } from '../../../common/models/index';
import { SvgIcon } from '../svg-icon/svg-icon';

export interface NavLogoProps extends React.Props<any> {
  onClick?: React.MouseEventHandler;
}

export interface NavLogoState {
}

export class NavLogo extends React.Component<NavLogoProps, NavLogoState> {

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    const { onClick } = this.props;

    return <div className="nav-logo" onClick={onClick}>
      <div className="logo">
        <SvgIcon svg={require('../../icons/pivot-logo.svg')}/>
      </div>
    </div>;
  }
}
