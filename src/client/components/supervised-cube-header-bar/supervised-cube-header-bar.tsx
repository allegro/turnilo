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

require('./supervised-cube-header-bar.css');

import * as React from 'react';
import { Duration, Timezone } from 'chronoshift';
import { classNames } from "../../utils/dom/dom";

import { STRINGS } from '../../config/constants';

import { SvgIcon } from '../svg-icon/svg-icon';
import { Clicker, Essence, DataCube, User, Customization, ExternalView, ViewSupervisor } from '../../../common/models/index';

import { HilukMenu } from '../hiluk-menu/hiluk-menu';
import { AutoRefreshMenu } from '../auto-refresh-menu/auto-refresh-menu';
import { UserMenu } from '../user-menu/user-menu';
import { Button } from '../button/button';
import { SettingsMenu } from '../settings-menu/settings-menu';

export interface SupervisedCubeHeaderBarProps extends React.Props<any> {
  essence: Essence;
  supervisor: ViewSupervisor;
  customization?: Customization;
  changeTimezone?: (timezone: Timezone) => void;
  timezone?: Timezone;
}

export interface SupervisedCubeHeaderBarState {
  settingsMenuOpen?: Element;
  needsConfirmation?: boolean;
}

export class SupervisedCubeHeaderBar extends React.Component<SupervisedCubeHeaderBarProps, SupervisedCubeHeaderBarState> {

  constructor() {
    super();
    this.state = {};
  }


  // Settings menu

  onSettingsMenuClick(e: MouseEvent) {
    const { settingsMenuOpen } = this.state;
    if (settingsMenuOpen) return this.onSettingsMenuClose();

    this.setState({
      settingsMenuOpen: e.target as Element
    });
  }

  onSettingsMenuClose() {
    this.setState({
      settingsMenuOpen: null
    });
  }

  renderSettingsMenu() {
    const { changeTimezone, timezone, customization, essence } = this.props;
    const { settingsMenuOpen } = this.state;
    if (!settingsMenuOpen) return null;

    return <SettingsMenu
      dataCube={essence.dataCube}
      timezone={timezone}
      timezones={customization.getTimezones()}
      changeTimezone={changeTimezone}
      openOn={settingsMenuOpen}
      onClose={this.onSettingsMenuClose.bind(this)}
    />;
  }

  onSave() {
    const { supervisor, essence } = this.props;

    if (supervisor.save) {
      supervisor.save(essence);
    } else if (supervisor.getConfirmationModal) {
      this.setState({needsConfirmation: true});
    }
  }

  render() {
    const { supervisor, customization, essence } = this.props;
    const { needsConfirmation } = this.state;

    var headerStyle: React.CSSProperties = null;
    if (customization && customization.headerBackground) {
      headerStyle = {
        background: customization.headerBackground
      };
    }

    var modal: JSX.Element = null;

    if (needsConfirmation) {
      modal = React.cloneElement(
        supervisor.getConfirmationModal(essence),
        {onCancel: () => this.setState({needsConfirmation: false})}
      );
    }

    return <header className="supervised-cube-header-bar" style={headerStyle}>
      <div className="left-bar">
        <div className="title">{supervisor.title}</div>
      </div>
      <div className="right-bar">
        <div className="icon-button settings" onClick={this.onSettingsMenuClick.bind(this)}>
          <SvgIcon className="settings-icon" svg={require('../../icons/full-settings.svg')}/>
        </div>
        <div className="button-group">
          <Button className="cancel" title="Cancel" type="secondary" onClick={supervisor.cancel}/>
          <Button className="save" title={supervisor.saveLabel || 'Save'} type="primary" onClick={this.onSave.bind(this)}/>
        </div>
      </div>
      {this.renderSettingsMenu()}
      {modal}
    </header>;
  }
}
