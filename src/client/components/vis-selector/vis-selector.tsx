/*
 * Copyright 2015-2016 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

require('./vis-selector.css');

import * as React from 'react';
import { findParentWithClass, classNames } from '../../utils/dom/dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { Clicker, Essence } from '../../../common/models/index';
import { VisSelectorMenu } from '../vis-selector-menu/vis-selector-menu';

export interface VisSelectorProps extends React.Props<any> {
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
    var target = findParentWithClass(e.target as Element, 'vis-selector');
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

    var menu: JSX.Element = null;
    if (menuOpenOn) {
      menu = React.createElement(VisSelectorMenu, {
        clicker,
        essence,
        openOn: menuOpenOn,
        onClose: this.closeMenu.bind(this)
      });
    }

    return <div className={classNames('vis-selector', { active: menuOpenOn })} onClick={this.openMenu.bind(this)}>
      <div className="vis-item selected">
        <SvgIcon svg={require('../../icons/vis-' + visualization.name + '.svg')}/>
        <div className="vis-title">{visualization.title}</div>
      </div>
      {menu}
    </div>;
  }
}
