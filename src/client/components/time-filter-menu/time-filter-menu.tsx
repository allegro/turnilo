'use strict';
require('./time-filter-menu.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Timezone, Duration, minute, hour, day, week, month, year } from 'chronoshift';
import { $, Expression, Executor, Dataset, TimeRange } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../../common/models/index';
import { formatTimeRange, DisplayYear } from '../../utils/date/date';
// import { ... } from '../../config/constants';
import { TimeInput } from '../time-input/time-input';

const quarter = Duration.fromJS('P3M');

function getLatest(maxTime: Date, tz: Timezone): TimePreset[] {
  var maxTimeMinuteCeil = minute.ceil(maxTime, tz);
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

export interface TimeFilterMenuProps {
  clicker: Clicker;
  essence: Essence;
  dimension: Dimension;
  onClose: Function;
}

export interface TimeFilterMenuState {
  tab?: string;
  selectedTimeRange?: TimeRange;
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
      hoverPreset: null,
      latestPresets: null,
      currentPresets: null,
      previousPresets: null
    };

  }

  componentWillMount() {
    var { essence, dimension } = this.props;
    var { dataSource, filter, timezone } = essence;

    var now = new Date();
    var maxTime = dataSource.getMaxTimeDate();

    this.setState({
      selectedTimeRange: filter.getTimeRange(dimension.expression),
      latestPresets: getLatest(maxTime, timezone),
      currentPresets: getCurrentOrPrevious(now, false, timezone),
      previousPresets: getCurrentOrPrevious(now, true, timezone)
    });
  }

  constructFilter(): Filter {
    var { essence, dimension } = this.props;
    var { selectedTimeRange } = this.state;
    var { filter } = essence;

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

  timeRangeStartChange(start: Date) {
    if (!start) return;
    var { selectedTimeRange } = this.state;
    this.setState({
      selectedTimeRange: new TimeRange({
        start,
        end: selectedTimeRange.end
      })
    });
  }

  timeRangeEndChange(end: Date) {
    if (!end) return;
    var { selectedTimeRange } = this.state;
    this.setState({
      selectedTimeRange: new TimeRange({
        start: selectedTimeRange.start,
        end
      })
    });
  }

  selectTab(tab: string) {
    this.setState({ tab });
  }

  onOkClick() {
    var { clicker, onClose } = this.props;
    clicker.changeFilter(this.constructFilter());
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
    var now = new Date();
    var maxTime = essence.dataSource.getMaxTimeDate();

    var presetToButton = (preset: TimePreset) => {
      var classNames = ['preset'];
      if (selectedTimeRange.equals(preset.timeRange)) classNames.push('selected');
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

  renderCustom() {
    var { essence, dimension } = this.props;
    var { selectedTimeRange } = this.state;
    if (!dimension) return null;

    if (!selectedTimeRange) return null;
    var { timezone, filter } = essence;

    var actionDisabled = filter.equals(this.constructFilter());

    return <div className="cont">
        <div className="type">start</div>
        <TimeInput time={selectedTimeRange.start} timezone={timezone} onChange={this.timeRangeStartChange.bind(this)}/>
        <div className="type">end</div>
        <TimeInput time={selectedTimeRange.end} timezone={timezone} onChange={this.timeRangeEndChange.bind(this)}/>
        <div className="button-bar">
          <button className="ok" onClick={this.onOkClick.bind(this)} disabled={actionDisabled}>OK</button>
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
