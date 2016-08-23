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

require('./link-header-bar.css');

import * as React from 'react';
import { Timezone } from 'chronoshift';
import { Fn } from '../../../../common/utils/general/general';

import { SvgIcon, UserMenu, SettingsMenu } from '../../../components/index';

import { User, Customization } from '../../../../common/models/index';

export interface LinkHeaderBarProps extends React.Props<any> {
  title: string;
  user?: User;
  onNavClick: Fn;
  onExploreClick: Fn;
  getUrlPrefix?: () => string;
  customization?: Customization;
  changeTimezone?: (timezone: Timezone) => void;
  timezone?: Timezone;
  stateful: boolean;
}

export interface LinkHeaderBarState {
  settingsMenuOpenOn?: Element;
  userMenuOpenOn?: Element;
}

export class LinkHeaderBar extends React.Component<LinkHeaderBarProps, LinkHeaderBarState> {

  constructor() {
    super();
    this.state = {
      settingsMenuOpenOn: null,
      userMenuOpenOn: null
    };
  }

  // User menu

  onUserMenuClick(e: MouseEvent) {
    const { userMenuOpenOn } = this.state;
    if (userMenuOpenOn) return this.onUserMenuClose();
    this.setState({
      userMenuOpenOn: e.target as Element
    });
  }

  onUserMenuClose() {
    this.setState({
      userMenuOpenOn: null
    });
  }

  renderUserMenu() {
    const { user, customization } = this.props;
    const { userMenuOpenOn } = this.state;
    if (!userMenuOpenOn) return null;

    return <UserMenu
      openOn={userMenuOpenOn}
      onClose={this.onUserMenuClose.bind(this)}
      user={user}
      customization={customization}
    />;
  }

  // Settings menu

  onSettingsMenuClick(e: MouseEvent) {
    const { settingsMenuOpenOn } = this.state;
    if (settingsMenuOpenOn) return this.onSettingsMenuClose();

    this.setState({
      settingsMenuOpenOn: e.target as Element
    });
  }

  onSettingsMenuClose() {
    this.setState({
      settingsMenuOpenOn: null
    });
  }

  renderSettingsMenu() {
    const { changeTimezone, timezone, customization, user, stateful } = this.props;
    const { settingsMenuOpenOn } = this.state;
    if (!settingsMenuOpenOn) return null;

    return <SettingsMenu
      user={user}
      timezone={timezone}
      timezones={customization.getTimezones()}
      changeTimezone={changeTimezone}
      openOn={settingsMenuOpenOn}
      onClose={this.onSettingsMenuClose.bind(this)}
      stateful={stateful}
    />;
  }

  render() {
    var { title, user, onNavClick, onExploreClick, customization } = this.props;

    var userButton: JSX.Element = null;
    if (user) {
      userButton = <div className="icon-button user" onClick={this.onUserMenuClick.bind(this)}>
        <SvgIcon svg={require('../../../icons/full-user.svg')}/>
      </div>;
    }

    var headerStyle: any = null;
    if (customization && customization.headerBackground) {
      headerStyle = {
        background: customization.headerBackground
      };
    }

    return <header className="link-header-bar" style={headerStyle}>
      <div className="left-bar" onClick={onNavClick}>
        <div className="menu-icon">
          <SvgIcon svg={require('../../../icons/menu.svg')}/>
        </div>
        <div className="title">{title}</div>
      </div>
      <div className="right-bar">
        <div className="text-button" onClick={onExploreClick}>Explore</div>
        <a className="icon-button help" href="https://groups.google.com/forum/#!forum/imply-user-group" target="_blank">
          <SvgIcon className="help-icon" svg={require('../../../icons/help.svg')}/>
        </a>
        <div className="icon-button settings" onClick={this.onSettingsMenuClick.bind(this)}>
          <SvgIcon className="settings-icon" svg={require('../../../icons/full-settings.svg')}/>
        </div>
        {userButton}
      </div>
      {this.renderUserMenu()}
    </header>;
  }
}
