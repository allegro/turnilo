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

require('./nav-list.css');

import * as React from 'react';
import { Fn } from '../../../common/utils/general/general';
import { classNames } from '../../utils/dom/dom';
import { SvgIcon } from '../svg-icon/svg-icon';

export interface NavLink {
  name: string;
  title: string;
  tooltip?: string;
  href?: string;
  newTab?: boolean;
  onClick?: Fn;
}

export interface NavListProps extends React.Props<any> {
  title?: string;
  navLinks: NavLink[];
  iconSvg?: string;
  selected?: string;
}

export interface NavListState {
}

export class NavList extends React.Component< NavListProps, NavListState> {

  renderIcon(iconSvg: string): any {
    if (!iconSvg) return null;
    return <span className="icon">
      <SvgIcon svg={iconSvg}/>
    </span>;
  }

  renderNavList() {
    const { navLinks, iconSvg, selected } = this.props;
    return navLinks.map((navLink) => {
      return React.createElement(
        navLink.href ? 'a' : 'div',
        {
          className: classNames('item', { selected: selected && selected === navLink.name }),
          key: navLink.name,
          title: navLink.tooltip,
          href: navLink.href,
          target: navLink.newTab ? '_blank' : null,
          onClick: navLink.onClick
        },
        this.renderIcon(iconSvg),
        navLink.title
      );
    });
  }

  render() {
    const { title } = this.props;

    var className = "nav-list";
    var titleSection: JSX.Element = null;
    if (title) {
      titleSection = <div className="group-title">{title}</div>;
    } else {
      className += " no-title";
    }

    return <div className={className}>
      {titleSection}
      <div className="items">
        {this.renderNavList()}
      </div>
    </div>;
  };
}
