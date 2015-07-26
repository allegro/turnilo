'use strict';

import React = require('react/addons');
import Icon = require('react-svg-icons');
import { $, Expression, Dispatcher, NativeDataset } from 'plywood';
import { Filter, Dimension, Measure } from '../../models/index';
// import { SomeComp } from '../some-comp/some-comp';

function isInside(child: Element, parent: Element): boolean {
  while (child) {
    if (child === parent) return true;
    child = child.parentElement;
  }
  return false;
}

interface SideDrawerProps {
  onClose: () => void;
}

interface SideDrawerState {
}

export class SideDrawer extends React.Component<SideDrawerProps, SideDrawerState> {

  constructor() {
    super();
    // this.state = {};
    this.globalMouseDownListener = this.globalMouseDownListener.bind(this);
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  componentDidMount() {
    window.addEventListener('mousedown', this.globalMouseDownListener);
    window.addEventListener('keydown', this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.globalMouseDownListener);
    window.removeEventListener('keydown', this.globalKeyDownListener);
  }

  componentWillReceiveProps(nextProps: SideDrawerProps) {

  }

  globalMouseDownListener(e: MouseEvent) {
    var myElement = React.findDOMNode(this);
    var target = <Element>e.target;

    if (isInside(target, myElement)) return;
    this.props.onClose();
  }

  globalKeyDownListener(event: KeyboardEvent) {
    if (event.which !== 27) return; // 27 = escape
    this.props.onClose();
  }

  render() {
    return JSX(`
      <div className="side-drawer">
        <div className="title">
          <Icon className="text-logo" name="combo-logo" height={24} color="#666666"/>
        </div>
        <ul className="data-sources">
          <li>Wikipedia</li>
          <li>Koalas to the Max</li>
        </ul>
        <div className="add-data-source">Add dataset</div>
      </div>
    `);
  }
}
