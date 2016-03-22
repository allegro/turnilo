require('./auto-refresh-menu.css');

import * as React from 'react';
import { Stage } from '../../../common/models/index';
import { STRINGS } from '../../config/constants';
import { BubbleMenu } from '../bubble-menu/bubble-menu';
import { Dropdown, DropdownProps } from '../dropdown/dropdown';

const AUTO_REFRESH_LABELS: Lookup<string> = {
  "0": "Off",
  "1": "Every minute",
  "5": "Every 5 minutes",
  "10": "Every 10 minutes",
  "60": "Every 60 minutes"
};

export interface AutoRefreshMenuProps extends React.Props<any> {
  openOn: Element;
  onClose: Function;
  autoRefreshRate: number;
  setAutoRefreshRate: Function;
  refreshMaxTime: Function;
}

export interface AutoRefreshMenuState {
}

export class AutoRefreshMenu extends React.Component<AutoRefreshMenuProps, AutoRefreshMenuState> {

  constructor() {
    super();
    // this.state = {};

  }

  renderRefreshIntervalDropdown() {
    const { autoRefreshRate, setAutoRefreshRate } = this.props;

    var items: number[] = [0, 1, 5, 10, 60];

    return React.createElement(Dropdown, {
      label: STRINGS.autoUpdate,
      items,
      selectedItem: autoRefreshRate,
      renderItem: (rate) => AUTO_REFRESH_LABELS[rate] || '???',
      onSelect: setAutoRefreshRate
    } as DropdownProps<number>);
  }

  render() {
    var { openOn, onClose, refreshMaxTime } = this.props;

    var stage = Stage.fromSize(260, 200);
    return <BubbleMenu
      className="auto-refresh-menu"
      direction="down"
      stage={stage}
      openOn={openOn}
      onClose={onClose}
    >
      {this.renderRefreshIntervalDropdown()}
      <button className="update-now-button">
        Update now
      </button>
      <div className="update-info" onClick={refreshMaxTime as any}>
        Updated 29 min ago
      </div>
    </BubbleMenu>;
  }
}
