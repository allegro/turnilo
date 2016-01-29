'use strict';
require('./time-filter-menu.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Timezone, Duration, minute, hour, day, week, month, year } from 'chronoshift';
import { $, Expression, Executor, Dataset, TimeRange } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../../common/models/index';
import { formatTimeRange, DisplayYear } from '../../utils/date/date';
import { enterKey } from '../../utils/dom/dom';
// import { ... } from '../../config/constants';
import { TimeInput } from '../time-input/time-input';

const quarter = Duration.fromJS('P3M');

function getLatest(maxTime: Date, tz: Timezone): TimePreset[] {
  var maxTimeMinuteCeil = minute.move(minute.floor(maxTime, tz), tz, 1);
  return [
    TimePreset.fromJS({
      name: '1H',
      timeRange: {
        start: hour.move(maxTimeMinuteCeil, tz, -1),
        end: maxTimeMinuteCeil
      }
    }),
    TimePreset.fromJS({
      name: '6H',
      timeRange: {
        start: hour.move(maxTimeMinuteCeil, tz, -6),
        end: maxTimeMinuteCeil
      }
    }),
    TimePreset.fromJS({
      name: '1D',
      timeRange: {
        start: day.move(maxTimeMinuteCeil, tz, -1),
        end: maxTimeMinuteCeil
      }
    }),
    TimePreset.fromJS({
      name: '7D',
      timeRange: {
        start: day.move(maxTimeMinuteCeil, tz, -7),
        end: maxTimeMinuteCeil
      }
    }),
    TimePreset.fromJS({
      name: '30D',
      timeRange: {
        start: day.move(maxTimeMinuteCeil, tz, -30),
        end: maxTimeMinuteCeil
      }
    })
  ];
}

function getCurrentOrPrevious(now: Date, previous: boolean, tz: Timezone): TimePreset[] {
  var nowFloorDay = day.floor(now, tz);
  var nowFloorWeek = week.floor(now, tz);
  var nowFloorMonth = month.floor(now, tz);
  var nowFloorQuarter = quarter.floor(now, tz);
  var nowFloorYear = year.floor(now, tz);

  if (previous) {
    nowFloorDay = day.move(nowFloorDay, tz, -1);
    nowFloorWeek = week.move(nowFloorWeek, tz, -1);
    nowFloorMonth = month.move(nowFloorMonth, tz, -1);
    nowFloorQuarter = quarter.move(nowFloorQuarter, tz, -1);
    nowFloorYear = year.move(nowFloorYear, tz, -1);
  }

  return [
    TimePreset.fromJS({
      name: 'D',
      timeRange: {
        start: nowFloorDay,
        end: day.move(nowFloorDay, tz, 1)
      }
    }),
    TimePreset.fromJS({
      name: 'W',
      timeRange: {
        start: nowFloorWeek,
        end: week.move(nowFloorWeek, tz, 1)
      }
    }),
    TimePreset.fromJS({
      name: 'M',
      timeRange: {
        start: nowFloorMonth,
        end: month.move(nowFloorMonth, tz, 1)
      }
    }),
    TimePreset.fromJS({
      name: 'Q',
      timeRange: {
        start: nowFloorQuarter,
        end: quarter.move(nowFloorQuarter, tz, 1)
      }
    }),
    TimePreset.fromJS({
      name: 'Y',
      timeRange: {
        start: nowFloorYear,
        end: year.move(nowFloorYear, tz, 1)
      }
    })
  ];
}

export interface TimeFilterMenuProps extends React.Props<any> {
  clicker: Clicker;
  essence: Essence;
  dimension: Dimension;
  onClose: Function;
}

export interface TimeFilterMenuState {
  tab?: string;
  selectedTimeRange?: TimeRange;
  startTime?: Date;
  endTime?: Date;
  hoverPreset?: TimePreset;
  latestPresets?: TimePreset[];
  currentPresets?: TimePreset[];
  previousPresets?: TimePreset[];
}

export class TimeFilterMenu extends React.Component<TimeFilterMenuProps, TimeFilterMenuState> {
  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      tab: 'presets',
      selectedTimeRange: null,
      startTime: null,
      endTime: null,
      hoverPreset: null,
      latestPresets: null,
      currentPresets: null,
      previousPresets: null
    };
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  componentWillMount() {
    var { essence, dimension } = this.props;
    var { dataSource, filter, timezone } = essence;

    var now = new Date();
    var maxTime = dataSource.getMaxTimeDate();
    var selectedTimeRange = filter.getTimeRange(dimension.expression);

    this.setState({
      latestPresets: getLatest(maxTime, timezone),
      selectedTimeRange,
      startTime: selectedTimeRange.start,
      endTime: selectedTimeRange.end,
      currentPresets: getCurrentOrPrevious(now, false, timezone),
      previousPresets: getCurrentOrPrevious(now, true, timezone)
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
    var { tab, selectedTimeRange, startTime, endTime } = this.state;
    var { filter } = essence;

    if (tab === 'custom') {
      if (startTime && endTime && startTime < endTime) {
        selectedTimeRange = TimeRange.fromJS({ start: startTime, end: endTime });
      } else {
        selectedTimeRange = null;
      }
    }

    if (!selectedTimeRange) return null;
    return filter.setTimeRange(dimension.expression, selectedTimeRange);
  }

  onPresetClick(preset: TimePreset) {
    var { clicker, onClose } = this.props;
    clicker.changeTimeRange(preset.timeRange);
    onClose();
  }

  onPresetMouseEnter(preset: TimePreset) {
    var { hoverPreset } = this.state;
    if (hoverPreset === preset) return;
    this.setState({
      hoverPreset: preset
    });
  }

  onPresetMouseLeave(preset: TimePreset) {
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
    var { selectedTimeRange, hoverPreset, latestPresets, currentPresets, previousPresets } = this.state;
    if (!dimension) return null;

    var { timezone } = essence;

    var presetToButton = (preset: TimePreset) => {
      var classNames = ['preset'];
      if (preset.timeRange.equals(selectedTimeRange)) classNames.push('selected');
      if (preset === hoverPreset) classNames.push('hover');
      return <button
        key={preset.name}
        className={classNames.join(' ')}
        onClick={this.onPresetClick.bind(this, preset)}
        onMouseEnter={this.onPresetMouseEnter.bind(this, preset)}
        onMouseLeave={this.onPresetMouseLeave.bind(this, preset)}
      >{preset.name}</button>;
    };

    var previewText = formatTimeRange(hoverPreset ? hoverPreset.timeRange : selectedTimeRange, timezone, DisplayYear.IF_DIFF);

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
    if (tab !== 'custom') return false;
    var newFilter = this.constructFilter();
    return newFilter && !essence.filter.equals(newFilter);
  }

  renderCustom() {
    var { essence, dimension } = this.props;
    var { selectedTimeRange, startTime, endTime } = this.state;
    if (!dimension) return null;

    if (!selectedTimeRange) return null;
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

    var tabs = ['presets', 'custom'].map((name) => {
      return <div
        className={'tab ' + (tab === name ? 'selected' : '')}
        key={name}
        onClick={this.selectTab.bind(this, name)}
      >{name}</div>;
    });

    return <div className="time-filter-menu">
      <div className="tabs">{tabs}</div>
      {tab === 'presets' ? this.renderPresets() : this.renderCustom()}
    </div>;
  }
}
