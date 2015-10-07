'use strict';
require('./body-portal.css');

import * as React from 'react/addons';
// import { SvgIcon } from '../svg-icon/svg-icon';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Clicker, Essence, Filter, Dimension, Measure } from '../../../common/models/index';
// import { SomeComp } from '../some-comp/some-comp';

export interface BodyPortalProps {
  children: any;
}

export interface BodyPortalState {
}

export class BodyPortal extends React.Component<BodyPortalProps, BodyPortalState> {
  private target: any = null; // HTMLElement, a div that is appended to the body
  private component: React.DOMComponent<any> = null; // ReactElement, which is mounted on the target

  constructor() {
    super();
    // this.state = {};
  }

  componentDidMount() {
    var newDiv = document.createElement('div');
    newDiv.className = 'body-portal';
    this.target = document.body.appendChild(newDiv);
    this.component = React.render(this.props.children, this.target);
  }

  componentDidUpdate() {
    this.component = React.render(this.props.children, this.target);
  }

  componentWillUnmount() {
    React.unmountComponentAtNode(this.target);
    document.body.removeChild(this.target);
  }

  render(): React.ReactElement<BodyPortalProps> {
    return null;
  }
}
