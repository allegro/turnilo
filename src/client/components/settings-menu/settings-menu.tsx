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

require('./settings-menu.css');

import * as React from 'react';
import { Timezone } from 'chronoshift';
import { Fn } from '../../../common/utils/general/general';
import { Stage, DataCube, User } from '../../../common/models/index';
import { STRINGS } from '../../config/constants';
import { BubbleMenu } from '../bubble-menu/bubble-menu';
import { Dropdown } from '../dropdown/dropdown';

export interface SettingsMenuProps extends React.Props<any> {
  dataCube?: DataCube;
  openOn: Element;
  onClose: Fn;
  changeTimezone?: (timezone: Timezone) => void;
  timezone?: Timezone;
  timezones?: Timezone[];
  user?: User;
  stateful: boolean;
}

export interface SettingsMenuState {
}

export class SettingsMenu extends React.Component<SettingsMenuProps, SettingsMenuState> {

  constructor() {
    super();
  }

  changeTimezone(newTimezone: Timezone) {
    const { onClose, changeTimezone } = this.props;
    changeTimezone(newTimezone);
    onClose();
  }

  renderSettingsLinks() {
    const { dataCube, user, stateful } = this.props;
    if (!stateful || !dataCube || !user || !user.allow['settings']) return null;

    return <div>
      <a href={`#settings/data_cubes/${dataCube.name}`}><div className="simple-item">{STRINGS.editThisCube}</div></a>
      <a href="#settings"><div className="simple-item">{STRINGS.generalSettings}</div></a>
      <div className="separator"/>
    </div>;
  }

  renderTimezonesDropdown() {
    const { timezone, timezones } = this.props;
    const TimezoneDropdown = Dropdown.specialize<Timezone>();

    return <TimezoneDropdown
      label={STRINGS.timezone}
      selectedItem={timezone}
      renderItem={(d: Timezone) => d.toString().replace(/_/g, ' ')}
      items={timezones}
      onSelect={this.changeTimezone.bind(this)}
    />;
  }

  render() {
    const { openOn, onClose } = this.props;

    var stage = Stage.fromSize(240, 200);
    return <BubbleMenu
      className="settings-menu"
      direction="down"
      stage={stage}
      openOn={openOn}
      onClose={onClose}
    >
      {this.renderSettingsLinks()}
      {this.renderTimezonesDropdown()}
    </BubbleMenu>;
  }
}
