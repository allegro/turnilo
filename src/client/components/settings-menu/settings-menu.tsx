require('./settings-menu.css');

import * as React from 'react';
import { Timezone } from 'chronoshift';
import { Fn } from '../../../common/utils/general/general';
import { Stage } from '../../../common/models/index';
import { STRINGS } from '../../config/constants';
import { BubbleMenu } from '../bubble-menu/bubble-menu';
import { Dropdown } from '../dropdown/dropdown';
var { WallTime } = require('chronoshift');
if (!WallTime.rules) {
  var tzData = require("chronoshift/lib/walltime/walltime-data.js");
  WallTime.init(tzData.rules, tzData.zones);
}

/*
 some fun timezones

 new Timezone("Pacific/Niue"), // -11.0
 new Timezone("Pacific/Marquesas"), // -9.5
 new Timezone("America/Tijuana"), // -8.0
 new Timezone("America/St_Johns"), // -3.5
 new Timezone("Asia/Kathmandu"), // +5.8
 new Timezone("Australia/Broken_Hill"), // +9.5
 new Timezone("Pacific/Kiritimati") // +14.0

 */

const TIMEZONES: Timezone[] = [
  new Timezone("America/Los_Angeles"), // -8.0
  new Timezone("America/Mexico_City"), // -6.0
  new Timezone("America/New_York"), // -5.0
  new Timezone("America/Argentina/San_Luis"), // -4.0
  Timezone.UTC,
  new Timezone("Asia/Jerusalem"), // +2.0
  new Timezone("Europe/Paris"), // +1.0
  new Timezone("Asia/Kathmandu"), // +5.8
  new Timezone("Asia/Hong_Kong"), // +8.0
  new Timezone("Pacific/Guam") // +10.0
];

export interface SettingsMenuProps extends React.Props<any> {
  changeTimezone?: (timezone: Timezone) => void;
  timezone?: Timezone;
  openOn: Element;
  onClose: Fn;
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

  renderTimezonesDropdown() {
    const { timezone } = this.props;
    return React.createElement(Dropdown, {
      label: STRINGS.timezone,
      selectedItem: timezone,
      renderItem: (d: Timezone) => d.toString().replace(/_/g, ' '),
      items: TIMEZONES,
      onSelect: this.changeTimezone.bind(this)
    });
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
      {this.renderTimezonesDropdown()}
    </BubbleMenu>;
  }
}
