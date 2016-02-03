'use strict';
require('./time-filter-menu.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Timezone, Duration, minute, hour, day, week, month, year } from 'chronoshift';
import { $, r, Expression, Executor, Dataset, TimeRange } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, FilterClause, Dimension, Measure } from '../../../common/models/index';
import { formatTimeRange, DisplayYear } from '../../utils/date/date';
import { enterKey } from '../../utils/dom/dom';
// import { ... } from '../../config/constants';
import { TimeInput } from '../time-input/time-input';

export interface Preset {
  name: string;
  check: Expression;
}

var $maxTime = $(FilterClause.MAX_TIME_REF_NAME);
var latestPresets: Preset[] = [
  { name: '1H',  check: $maxTime.timeRange('PT1H', -1) },
  { name: '6H',  check: $maxTime.timeRange('PT6H', -1) },
  { name: '1D',  check: $maxTime.timeRange('P1D', -1)  },
  { name: '7D',  check: $maxTime.timeRange('P1D', -7)  },
  { name: '30D', check: $maxTime.timeRange('P1D', -30) }
];

var $now = $(FilterClause.NOW_REF_NAME);
var currentPresets: Preset[] = [
  { name: 'D', check: $now.timeBucket('P1D') },
  { name: 'W', check: $now.timeBucket('P1W') },
  { name: 'M', check: $now.timeBucket('P1M') },
  { name: 'Q', check: $now.timeBucket('P3M') },
  { name: 'Y', check: $now.timeBucket('P1Y') }
];

var previousPresets: Preset[] = [
  { name: 'D', check: $now.timeFloor('P1D').timeRange('P1D', -1) },
  { name: 'W', check: $now.timeFloor('P1W').timeRange('P1W', -1) },
  { name: 'M', check: $now.timeFloor('P1M').timeRange('P1M', -1) },
  { name: 'Q', check: $now.timeFloor('P3M').timeRange('P3M', -1) },
  { name: 'Y', check: $now.timeFloor('P1Y').timeRange('P1Y', -1) }
];

export interface TimeFilterMenuProps extends React.Props<any> {
  clicker: Clicker;
  essence: Essence;
  dimension: Dimension;
  onClose: Function;
}

export interface TimeFilterMenuState {
  tab?: string;
  selectedTimeCheck?: Expression;
  startTime?: Date;
  endTime?: Date;
  hoverPreset?: Preset;
}

export class TimeFilterMenu extends React.Component<TimeFilterMenuProps, TimeFilterMenuState> {
  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      tab: 'relative',
      selectedTimeCheck: null,
      startTime: null,
      endTime: null,
      hoverPreset: null
    };
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  componentWillMount() {
    var { essence, dimension } = this.props;
    var { filter } = essence;

    var selectedTimeCheck = filter.getCheck(dimension.expression);
    var selectedTimeRange = essence.evaluateCheck(selectedTimeCheck);

    this.setState({
      selectedTimeCheck,
      startTime: selectedTimeRange ? selectedTimeRange.start : null,
      endTime: selectedTimeRange ? selectedTimeRange.end : null
    });
  }

  componentDidMount() {
    window.addEventListener('keydown', this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.globalKeyDownListener);
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (enterKey(e)) {
      this.onOkClick();
    }
  }

  constructFilter(): Filter {
    var { essence, dimension } = this.props;
    var { tab, startTime, endTime } = this.state;
    var { filter } = essence;

    if (tab !== 'specific') return null;

    if (startTime && endTime && startTime < endTime) {
      return filter.setTimeCheck(dimension.expression, r(TimeRange.fromJS({ start: startTime, end: endTime })));
    } else {
      return null;
    }
  }

  onPresetClick(preset: Preset) {
    var { clicker, onClose } = this.props;
    clicker.changeTimeCheck(preset.check);
    onClose();
  }

  onPresetMouseEnter(preset: Preset) {
    var { hoverPreset } = this.state;
    if (hoverPreset === preset) return;
    this.setState({
      hoverPreset: preset
    });
  }

  onPresetMouseLeave(preset: Preset) {
    var { hoverPreset } = this.state;
    if (hoverPreset !== preset) return;
    this.setState({
      hoverPreset: null
    });
  }

  onStartChange(start: Date) {
    this.setState({
      startTime: start
    });
  }

  onEndChange(end: Date) {
    this.setState({
      endTime: end
    });
  }

  selectTab(tab: string) {
    this.setState({ tab });
  }

  onOkClick() {
    if (!this.actionEnabled()) return;
    var { clicker, onClose } = this.props;
    var newFilter = this.constructFilter();
    if (!newFilter) return;
    clicker.changeFilter(newFilter);
    onClose();
  }

  onCancelClick() {
    var { onClose } = this.props;
    onClose();
  }

  renderPresets() {
    var { essence, dimension } = this.props;
    var { selectedTimeCheck, hoverPreset } = this.state;
    if (!dimension) return null;

    var { timezone } = essence;

    var presetToButton = (preset: Preset) => {
      var classNames = ['preset'];
      if (preset.check.equals(selectedTimeCheck)) classNames.push('selected');
      if (preset === hoverPreset) classNames.push('hover');
      return <button
        key={preset.name}
        className={classNames.join(' ')}
        onClick={this.onPresetClick.bind(this, preset)}
        onMouseEnter={this.onPresetMouseEnter.bind(this, preset)}
        onMouseLeave={this.onPresetMouseLeave.bind(this, preset)}
      >{preset.name}</button>;
    };

    var previewTimeRange = essence.evaluateCheck(hoverPreset ? hoverPreset.check : selectedTimeCheck);
    var previewText = formatTimeRange(previewTimeRange, timezone, DisplayYear.IF_DIFF);

    return <div className="cont">
      <div className="type">latest</div>
      <div className="buttons">{latestPresets.map(presetToButton)}</div>
      <div className="type">current</div>
      <div className="buttons">{currentPresets.map(presetToButton)}</div>
      <div className="type">previous</div>
      <div className="buttons">{previousPresets.map(presetToButton)}</div>
      <div className="preview">{previewText}</div>
    </div>;
  }

  actionEnabled() {
    var { essence } = this.props;
    var { tab } = this.state;
    if (tab !== 'specific') return false;
    var newFilter = this.constructFilter();
    return newFilter && !essence.filter.equals(newFilter);
  }

  renderCustom() {
    var { essence, dimension } = this.props;
    var { selectedTimeCheck, startTime, endTime } = this.state;
    if (!dimension) return null;

    if (!selectedTimeCheck) return null;
    var { timezone } = essence;

    return <div className="cont">
      <div className="type">start</div>
      <TimeInput time={startTime} timezone={timezone} onChange={this.onStartChange.bind(this)}/>
      <div className="type">end</div>
      <TimeInput time={endTime} timezone={timezone} onChange={this.onEndChange.bind(this)}/>
      <div className="button-bar">
        <button className="ok" onClick={this.onOkClick.bind(this)} disabled={!this.actionEnabled()}>OK</button>
        <button className="cancel" onClick={this.onCancelClick.bind(this)}>Cancel</button>
      </div>
    </div>;
  }

  render() {
    var { dimension } = this.props;
    var { tab } = this.state;
    if (!dimension) return null;

    var tabs = ['relative', 'specific'].map((name) => {
      return <div
        className={'tab ' + (tab === name ? 'selected' : '')}
        key={name}
        onClick={this.selectTab.bind(this, name)}
      >{name}</div>;
    });

    return <div className="time-filter-menu">
      <div className="tabs">{tabs}</div>
      {tab === 'relative' ? this.renderPresets() : this.renderCustom()}
    </div>;
  }
}
