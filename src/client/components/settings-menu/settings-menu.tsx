require('./settings-menu.css');

import * as React from 'react';
import { Timezone } from 'chronoshift';
import { Fn } from '../../../common/utils/general/general';
import { Stage } from '../../../common/models/index';
import { STRINGS } from '../../config/constants';
import { BubbleMenu } from '../bubble-menu/bubble-menu';
import { Dropdown } from '../dropdown/dropdown';

export interface SettingsMenuProps extends React.Props<any> {
  openOn: Element;
  onClose: Fn;
  changeTimezone?: (timezone: Timezone) => void;
  timezone?: Timezone;
  timezones?: Timezone[];
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
    const { timezone, timezones } = this.props;
    return React.createElement(Dropdown, {
      label: STRINGS.timezone,
      selectedItem: timezone,
      renderItem: (d: Timezone) => d.toString().replace(/_/g, ' '),
      items: timezones,
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
