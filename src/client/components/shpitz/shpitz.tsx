require('./shpitz.css');

import * as React from 'react';
import { classNames } from '../../utils/dom/dom';

export interface ShpitzProps extends React.Props<any> {
  direction: string;
  style?: any;
}

export interface ShpitzState {
}

export class Shpitz extends React.Component<ShpitzProps, ShpitzState> {

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    const { direction, style } = this.props;

    return <div className={classNames('shpitz', direction)} style={style}>
      <div className="rectangle"></div>
    </div>;
  }
}
