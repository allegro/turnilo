require('./auto-refresh-menu.css');

import * as React from 'react';
import { Duration } from 'chronoshift';
import { Fn } from "../../../common/utils/general/general";
import { Stage, DataSource } from '../../../common/models/index';
import { STRINGS } from '../../config/constants';
import { BubbleMenu } from '../bubble-menu/bubble-menu';
import { Dropdown, DropdownProps } from '../dropdown/dropdown';

const AUTO_REFRESH_LABELS: Lookup<string> = {
  "null": "Off",
  "PT5S": "Every 5 seconds",
  "PT15S": "Every 15 seconds",
  "PT1M": "Every minute",
  "PT5M": "Every 5 minutes",
  "PT10M": "Every 10 minutes",
  "PT30M": "Every 30 minutes"
};

const REFRESH_DURATIONS: Duration[] = [
  null,
  Duration.fromJS("PT5S"),
  Duration.fromJS("PT15S"),
  Duration.fromJS("PT1M"),
  Duration.fromJS("PT5M"),
  Duration.fromJS("PT10M"),
  Duration.fromJS("PT30M")
];

export interface AutoRefreshMenuProps extends React.Props<any> {
  openOn: Element;
  onClose: Fn;
  autoRefreshRate: Duration;
  setAutoRefreshRate: Fn;
  refreshMaxTime: Fn;
  dataSource: DataSource;
}

export interface AutoRefreshMenuState {
}

export class AutoRefreshMenu extends React.Component<AutoRefreshMenuProps, AutoRefreshMenuState> {

  constructor() {
    super();
    // this.state = {};

  }

  onRefreshNowClick() {
    var { refreshMaxTime } = this.props;
    refreshMaxTime();
  }

  renderRefreshIntervalDropdown() {
    const { autoRefreshRate, setAutoRefreshRate } = this.props;

    return React.createElement(Dropdown, {
      label: STRINGS.autoUpdate,
      items: REFRESH_DURATIONS,
      selectedItem: autoRefreshRate,
      renderItem: (d) => AUTO_REFRESH_LABELS[String(d)] || `Custom ${d}`,
      onSelect: setAutoRefreshRate
    } as DropdownProps<Duration>);
  }

  render() {
    var { openOn, onClose, dataSource } = this.props;

    var stage = Stage.fromSize(240, 200);
    return <BubbleMenu
      className="auto-refresh-menu"
      direction="down"
      stage={stage}
      openOn={openOn}
      onClose={onClose}
    >
      {this.renderRefreshIntervalDropdown()}
      <button className="update-now-button" onClick={this.onRefreshNowClick.bind(this)}>Update now</button>
      <div className="update-info">{dataSource.updatedText()}</div>
    </BubbleMenu>;
  }
}
