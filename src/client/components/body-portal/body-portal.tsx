require('./body-portal.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface BodyPortalProps extends React.Props<any> {
  left?: number;
  top?: number;
  fullSize?: boolean;
  disablePointerEvents?: boolean;
}

export interface BodyPortalState {
}

export class BodyPortal extends React.Component<BodyPortalProps, BodyPortalState> {
  private target: any = null; // HTMLElement, a div that is appended to the body
  private component: React.DOMComponent<any> = null; // ReactElement, which is mounted on the target

  constructor() {
    super();
  }

  updateStyle() {
    var { left, top, disablePointerEvents } = this.props;
    var style = this.target.style;
    if (typeof left === 'number') {
      style.left = Math.round(left) + 'px';
    }
    if (typeof top === 'number') {
      style.top = Math.round(top) + 'px';
    }
    style['z-index'] = disablePointerEvents ? 200 : 201;
    style['pointer-events'] = disablePointerEvents ? 'none' : 'auto';
  }

  componentDidMount() {
    this.teleport();
  }

  teleport() {
    var { fullSize } = this.props;
    var newDiv = document.createElement('div');
    newDiv.className = 'body-portal' + (fullSize ? ' full-size' : '');
    this.target = document.body.appendChild(newDiv);
    this.updateStyle();
    this.component = ReactDOM.render(React.Children.only(this.props.children) as any, this.target);
  }

  componentDidUpdate() {
    this.updateStyle();
    this.component = ReactDOM.render(React.Children.only(this.props.children) as any, this.target);
  }

  componentWillUnmount() {
    ReactDOM.unmountComponentAtNode(this.target);
    document.body.removeChild(this.target);
  }

  render(): React.ReactElement<BodyPortalProps> {
    return null;
  }
}
