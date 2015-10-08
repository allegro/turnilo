'use strict';
require('./vis-selector.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { List } from 'immutable';
import { $, Expression, Executor, Dataset } from 'plywood';
import { findParentWithClass } from '../../utils/dom/dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { Clicker, Essence, Measure, Manifest } from '../../../common/models/index';
import { VisSelectorMenu } from '../vis-selector-menu/vis-selector-menu';

export interface VisSelectorProps {
  clicker: Clicker;
  essence: Essence;
}

export interface VisSelectorState {
  menuOpenOn?: Element;
}

export class VisSelector extends React.Component<VisSelectorProps, VisSelectorState> {

  constructor() {
    super();
    this.state = {
      menuOpenOn: null
    };

  }

  openMenu(e: MouseEvent) {
    var { menuOpenOn } = this.state;
    var target = findParentWithClass(<Element>e.target, 'vis-selector');
    if (menuOpenOn === target) {
      this.closeMenu();
      return;
    }
    this.setState({
      menuOpenOn: target
    });
  }

  closeMenu() {
    this.setState({
      menuOpenOn: null
    });
  }

  render() {
    var { clicker, essence } = this.props;
    var { menuOpenOn } = this.state;
    var { visualization } = essence;

    var menu: React.ReactElement<any> = null;
    if (menuOpenOn) {
      menu = React.createElement(VisSelectorMenu, {
        clicker,
        essence,
        openOn: menuOpenOn,
        onClose: this.closeMenu.bind(this)
      });
    }

    return JSX(`
      <div className="vis-selector" onClick={this.openMenu.bind(this)}>
        <div className="vis-item selected">
          <SvgIcon svg={require('../../icons/vis-' + visualization.id + '.svg')}/>
          <div className="vis-title">{visualization.title}</div>
        </div>
        {menu}
      </div>
    `);
  }
}
