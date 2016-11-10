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

require('./side-drawer.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Fn } from '../../../common/utils/general/general';
import { STRINGS } from '../../config/constants';
import { isInside, escapeKey, classNames } from '../../utils/dom/dom';
import { DataCube, Customization, User, Collection } from '../../../common/models/index';
import { NavLogo } from '../nav-logo/nav-logo';
import { SvgIcon } from '../svg-icon/svg-icon';
import { NavList } from '../nav-list/nav-list';

export interface SideDrawerProps extends React.Props<any> {
  user: User;
  selectedItem: DataCube | Collection;
  collections: Collection[];
  dataCubes: DataCube[];
  onOpenAbout: Fn;
  onClose: Fn;
  customization?: Customization;
  itemHrefFn?: (oldItem?: DataCube | Collection, newItem?: DataCube | Collection) => string;
  viewType: 'home' | 'cube' | 'collection' | 'link' | 'settings' | 'no-data';
}

export interface SideDrawerState {
}

export class SideDrawer extends React.Component<SideDrawerProps, SideDrawerState> {

  constructor() {
    super();

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

  globalMouseDownListener(e: MouseEvent) {
    var myElement = ReactDOM.findDOMNode(this);
    var target = e.target as Element;

    if (isInside(target, myElement)) return;
    this.props.onClose();
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (!escapeKey(e)) return;
    this.props.onClose();
  }

  onHomeClick() {
    window.location.hash = '#';
  }

  onOpenSettings() {
    window.location.hash = '#settings';
  }

  renderOverviewLink() {
    const { viewType } = this.props;

    return <div className="home-container">
      <div
        className={classNames('home-link', {selected: viewType === 'home'})}
        onClick={this.onHomeClick.bind(this)}
      >
        <SvgIcon svg={require('../../icons/home.svg')}/>
        <span>{viewType === 'link' ? 'Overview' : 'Home'}</span>
      </div>
    </div>;
  }

  renderItems(items: (DataCube | Collection)[], icon: string, urlPrefix = ''): JSX.Element {
    if (!items || items.length === 0) return null;

    var { itemHrefFn, selectedItem } = this.props;

    var navLinks = items.map(item => {
      return {
        name: item.name,
        title: item.title,
        tooltip: item.description,
        href: itemHrefFn(selectedItem, item) || `#${urlPrefix}${item.name}`
      };
    });

    return <NavList
      selected={selectedItem ? selectedItem.name : null}
      navLinks={navLinks}
      iconSvg={require(`../../icons/${icon}`)}
    />;
  }

  render() {
    var { onClose, selectedItem, collections, dataCubes, onOpenAbout, customization, itemHrefFn, user } = this.props;

    var infoAndFeedback: any[] = [];

    if (user && user.allow['settings']) {
      infoAndFeedback.push({
        name: 'settings',
        title: STRINGS.settings,
        tooltip: 'Settings',
        onClick: () => {
          onClose();
          this.onOpenSettings();
        }
      });
    }

    infoAndFeedback.push({
      name: 'info',
      title: STRINGS.infoAndFeedback,
      tooltip: 'Learn more about Pivot',
      onClick: () => {
        onClose();
        onOpenAbout();
      }
    });

    var customLogoSvg: string = null;
    if (customization && customization.customLogoSvg) {
      customLogoSvg = customization.customLogoSvg;
    }

    return <div className="side-drawer">
      <NavLogo customLogoSvg={customLogoSvg} onClick={onClose}/>
      {this.renderOverviewLink()}
      {this.renderItems(dataCubes, 'full-cube.svg')}
      {this.renderItems(collections, 'full-collection.svg', 'collection/')}
      <NavList navLinks={infoAndFeedback}/>

    </div>;
  }
}
