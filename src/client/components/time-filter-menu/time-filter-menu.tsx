require('./time-filter-menu.css');

import * as React from 'react';
import { Timezone, Duration, minute, hour, day, week, month, year } from 'chronoshift';
import { $, r, Expression, Executor, Dataset, TimeRange } from 'plywood';
import { Fn } from "../../../common/utils/general/general";
import { STRINGS } from '../../config/constants';
import { Stage, Clicker, Essence, DataSource, Filter, FilterClause, Dimension, Measure } from '../../../common/models/index';
import { formatTimeRange, DisplayYear } from '../../utils/date/date';
import { enterKey, classNames } from '../../utils/dom/dom';
import { TimeInput } from '../time-input/time-input';

export interface Preset {
  name: string;
  selection: Expression;
}

var $maxTime = $(FilterClause.MAX_TIME_REF_NAME);
var latestPresets: Preset[] = [
  { name: '1H',  selection: $maxTime.timeRange('PT1H', -1) },
  { name: '6H',  selection: $maxTime.timeRange('PT6H', -1) },
  { name: '1D',  selection: $maxTime.timeRange('P1D', -1)  },
  { name: '7D',  selection: $maxTime.timeRange('P1D', -7)  },
  { name: '30D', selection: $maxTime.timeRange('P1D', -30) }
];

var $now = $(FilterClause.NOW_REF_NAME);
var currentPresets: Preset[] = [
  { name: 'D', selection: $now.timeBucket('P1D') },
  { name: 'W', selection: $now.timeBucket('P1W') },
  { name: 'M', selection: $now.timeBucket('P1M') },
  { name: 'Q', selection: $now.timeBucket('P3M') },
  { name: 'Y', selection: $now.timeBucket('P1Y') }
];

var previousPresets: Preset[] = [
  { name: 'D', selection: $now.timeFloor('P1D').timeRange('P1D', -1) },
  { name: 'W', selection: $now.timeFloor('P1W').timeRange('P1W', -1) },
  { name: 'M', selection: $now.timeFloor('P1M').timeRange('P1M', -1) },
  { name: 'Q', selection: $now.timeFloor('P3M').timeRange('P3M', -1) },
  { name: 'Y', selection: $now.timeFloor('P1Y').timeRange('P1Y', -1) }
];

export interface TimeFilterMenuProps extends React.Props<any> {
  clicker: Clicker;
  essence: Essence;
  dimension: Dimension;
  onClose: Fn;
}

export interface TimeFilterMenuState {
  tab?: string;
  timeSelection?: Expression;
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
      timeSelection: null,
      startTime: null,
      endTime: null,
      hoverPreset: null
    };
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  componentWillMount() {
    var { essence, dimension } = this.props;
    var { filter } = essence;

    var timeSelection = filter.getSelection(dimension.expression);
    var selectedTimeRange = essence.evaluateSelection(timeSelection);

    this.setState({
      timeSelection,
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
      return filter.setSelection(dimension.expression, r(TimeRange.fromJS({ start: startTime, end: endTime })));
    } else {
      return null;
    }
  }

  onPresetClick(preset: Preset) {
    var { clicker, onClose } = this.props;
    clicker.changeTimeSelection(preset.selection);
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
    var { timeSelection, hoverPreset } = this.state;
    if (!dimension) return null;

    var { timezone } = essence;

    var presetToButton = (preset: Preset) => {
      return <button
        key={preset.name}
        className={classNames('preset', { hover: preset === hoverPreset, selected: preset.selection.equals(timeSelection) })}
        onClick={this.onPresetClick.bind(this, preset)}
        onMouseEnter={this.onPresetMouseEnter.bind(this, preset)}
        onMouseLeave={this.onPresetMouseLeave.bind(this, preset)}
      >{preset.name}</button>;
    };

    var previewTimeRange = essence.evaluateSelection(hoverPreset ? hoverPreset.selection : timeSelection);
    var previewText = formatTimeRange(previewTimeRange, timezone, DisplayYear.IF_DIFF);

    return <div className="cont">
      <div className="type">{STRINGS.latest}</div>
      <div className="buttons">{latestPresets.map(presetToButton)}</div>
      <div className="type">{STRINGS.current}</div>
      <div className="buttons">{currentPresets.map(presetToButton)}</div>
      <div className="type">{STRINGS.previous}</div>
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
    var { timeSelection, startTime, endTime } = this.state;
    if (!dimension) return null;

    if (!timeSelection) return null;
    var { timezone } = essence;

    return <div className="cont">
      <div className="type">{STRINGS.start}</div>
      <TimeInput time={startTime} timezone={timezone} onChange={this.onStartChange.bind(this)}/>
      <div className="type">{STRINGS.end}</div>
      <TimeInput time={endTime} timezone={timezone} onChange={this.onEndChange.bind(this)}/>
      <div className="button-bar">
        <button className="ok" onClick={this.onOkClick.bind(this)} disabled={!this.actionEnabled()}>{STRINGS.ok}</button>
        <button className="cancel" onClick={this.onCancelClick.bind(this)}>{STRINGS.cancel}</button>
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
      >{name === 'relative' ? STRINGS.relative : STRINGS.specific}</div>;
    });

    return <div className="time-filter-menu">
      <div className="tabs">{tabs}</div>
      {tab === 'relative' ? this.renderPresets() : this.renderCustom()}
    </div>;
  }
}
