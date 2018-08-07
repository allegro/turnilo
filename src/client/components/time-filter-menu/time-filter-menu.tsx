/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2018 Allegro.pl
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

import { day, second, Timezone } from "chronoshift";
import { $, Expression, LiteralExpression, r, Range, Set, TimeRange } from "plywood";
import * as React from "react";
import { Clicker, Dimension, Essence, Filter, FilterClause, Stage, Timekeeper } from "../../../common/models";
import { TimeShift } from "../../../common/models/time-shift/time-shift";
import { DisplayYear, Fn, formatTimeRange } from "../../../common/utils";
import { STRINGS } from "../../config/constants";
import { classNames, enterKey } from "../../utils/dom/dom";
import { BubbleMenu } from "../bubble-menu/bubble-menu";
import { ButtonGroup } from "../button-group/button-group";
import { Button } from "../button/button";
import { DateRangePicker } from "../date-range-picker/date-range-picker";
import "./time-filter-menu.scss";

function makeDateIntoTimeRange(input: Date, timezone: Timezone): TimeRange {
  return new TimeRange({ start: second.shift(input, timezone, -1), end: second.shift(input, timezone, 1) });
}

export interface Preset {
  name: string;
  selection: Expression;
}

const $MAX_TIME = $(FilterClause.MAX_TIME_REF_NAME);
const $NOW = $(FilterClause.NOW_REF_NAME);

const latestPresets: Preset[] = [
  { name: "1H", selection: $MAX_TIME.timeRange("PT1H", -1) },
  { name: "6H", selection: $MAX_TIME.timeRange("PT6H", -1) },
  { name: "1D", selection: $MAX_TIME.timeRange("P1D", -1) },
  { name: "7D", selection: $MAX_TIME.timeRange("P1D", -7) },
  { name: "30D", selection: $MAX_TIME.timeRange("P1D", -30) }
];

const CURRENT_PRESETS: Preset[] = [
  { name: "D", selection: $NOW.timeFloor("P1D").timeRange("P1D", 1) },
  { name: "W", selection: $NOW.timeFloor("P1W").timeRange("P1W", 1) },
  { name: "M", selection: $NOW.timeFloor("P1M").timeRange("P1M", 1) },
  { name: "Q", selection: $NOW.timeFloor("P3M").timeRange("P3M", 1) },
  { name: "Y", selection: $NOW.timeFloor("P1Y").timeRange("P1Y", 1) }
];

const PREVIOUS_PRESETS: Preset[] = [
  { name: "D", selection: $NOW.timeFloor("P1D").timeRange("P1D", -1) },
  { name: "W", selection: $NOW.timeFloor("P1W").timeRange("P1W", -1) },
  { name: "M", selection: $NOW.timeFloor("P1M").timeRange("P1M", -1) },
  { name: "Q", selection: $NOW.timeFloor("P3M").timeRange("P3M", -1) },
  { name: "Y", selection: $NOW.timeFloor("P1Y").timeRange("P1Y", -1) }
];

const COMPARISON_PRESETS = [
  { label: "Off", timeShift: TimeShift.empty() },
  { label: "D", timeShift: TimeShift.fromJS("P1D") },
  { label: "W", timeShift: TimeShift.fromJS("P1W") },
  { label: "M", timeShift: TimeShift.fromJS("P1M") },
  { label: "Q", timeShift: TimeShift.fromJS("P3M") }
];

const MENU_WIDTH = 250;

export interface TimeFilterMenuProps {
  clicker: Clicker;
  timekeeper: Timekeeper;
  essence: Essence;
  dimension: Dimension;
  onClose: Fn;

  containerStage: Stage;
  openOn: Element;
  inside: Element;
}

export interface TimeFilterMenuState {
  tab?: string;
  timeSelection?: Expression;
  startTime?: Date;
  endTime?: Date;
  hoverPreset?: Preset;
  hoverTimeShift?: TimeShift;
  fixedTimeShift: TimeShift;
}

export class TimeFilterMenu extends React.Component<TimeFilterMenuProps, TimeFilterMenuState> {

  private static readonly RELATIVE_TAB = "relative";
  private static readonly FIXED_TAB = "fixed";

  public mounted: boolean;

  constructor(props: TimeFilterMenuProps) {
    super(props);
    this.state = {
      tab: null,
      timeSelection: null,
      startTime: null,
      endTime: null,
      hoverPreset: null,
      fixedTimeShift: props.essence.timeShift
    };
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  componentWillMount() {
    const { essence, timekeeper, dimension } = this.props;
    const { filter } = essence;
    const { timezone } = essence;

    const dimensionExpression = dimension.expression;
    const timeSelection = filter.getSelection(dimensionExpression) as Expression;
    const selectedTimeRangeSet = essence.getEffectiveFilter(timekeeper).getLiteralSet(dimensionExpression);
    let selectedTimeRange = (selectedTimeRangeSet && selectedTimeRangeSet.size() === 1) ? selectedTimeRangeSet.elements[0] : null;
    if (selectedTimeRange && !Range.isRange(selectedTimeRange)) {
      selectedTimeRange = makeDateIntoTimeRange(selectedTimeRange, timezone);
    }
    const clause = filter.clauseForExpression(dimensionExpression);

    this.setState({
      timeSelection,
      tab: (!clause || clause.relative) ? TimeFilterMenu.RELATIVE_TAB : TimeFilterMenu.FIXED_TAB,
      startTime: selectedTimeRange ? selectedTimeRange.start : null,
      endTime: selectedTimeRange ? selectedTimeRange.end : null
    });
  }

  componentDidMount() {
    window.addEventListener("keydown", this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.globalKeyDownListener);
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (enterKey(e)) {
      this.onOkClick();
    }
  }

  constructFixedFilter(): Filter {
    const { tab } = this.state;
    if (tab !== TimeFilterMenu.FIXED_TAB) return null;

    let { startTime, endTime } = this.state;
    const { essence, dimension } = this.props;
    const { filter } = essence;
    const { timezone } = essence;

    if (startTime && !endTime) {
      endTime = day.shift(startTime, timezone, 1);
    }

    if (startTime && endTime && startTime < endTime) {
      return filter.setSelection(dimension.expression, r(TimeRange.fromJS({ start: startTime, end: endTime })));
    } else {
      return null;
    }
  }

  saveTimeShift(timeShift: TimeShift) {
    const { clicker, onClose } = this.props;
    clicker.changeComparisonShift(timeShift);
    onClose();
  }

  onPresetClick(preset: Preset) {
    const { clicker, onClose, essence, dimension } = this.props;
    const { filter } = essence;
    const newFilter = filter.setSelection(dimension.expression, preset.selection);
    clicker.changeFilter(newFilter);
    onClose();
  }

  onPresetMouseEnter(preset: Preset) {
    const { hoverPreset } = this.state;
    if (hoverPreset === preset) return;
    this.setState({
      hoverPreset: preset
    });
  }

  onPresetMouseLeave(preset: Preset) {
    const { hoverPreset } = this.state;
    if (hoverPreset !== preset) return;
    this.setState({
      hoverPreset: null
    });
  }

  onClickTimeShift(timeShift: TimeShift) {
    const { fixedTimeShift } = this.state;
    if (fixedTimeShift === timeShift) return;
    this.setState({
      fixedTimeShift: timeShift
    });
  }

  onTimeShiftMouseEnter(timeShift: TimeShift) {
    const { hoverTimeShift } = this.state;
    if (hoverTimeShift === timeShift) return;
    this.setState({
      hoverTimeShift: timeShift
    });
  }

  onTimeShiftMouseLeave(timeShift: TimeShift) {
    const { hoverTimeShift } = this.state;
    if (hoverTimeShift !== timeShift) return;
    this.setState({
      hoverTimeShift: null
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
    const { clicker, onClose } = this.props;
    const { fixedTimeShift } = this.state;
    const newFilter = this.constructFixedFilter();
    if (!newFilter) {
      throw new Error("Couldn't construct time filter");
    }
    clicker.changeFilter(newFilter);
    clicker.changeComparisonShift(fixedTimeShift);
    onClose();
  }

  onCancelClick() {
    const { onClose } = this.props;
    onClose();
  }

  shiftAndFormatTimeRange(timeRange: TimeRange, timeShift: TimeShift) {
    const { essence: { timezone } } = this.props;
    const { bounds, start, end } = timeRange;
    const duration = timeShift.valueOf();
    const shiftedTimeRange = TimeRange.fromJS({
      start: duration.shift(start, timezone, -1),
      end: duration.shift(end, timezone, -1),
      bounds
    });
    return formatTimeRange(shiftedTimeRange, timezone, DisplayYear.IF_DIFF);
  }

  timeShiftToButton(onClick: Function, selectedTimeShift: TimeShift) {
    return ({ label, timeShift }: { label: string, timeShift: TimeShift }) => <button
      key={timeShift.toJS()}
      className={classNames("preset", { selected: selectedTimeShift.equals(timeShift) })}
      onClick={onClick.bind(this, timeShift)}
      onMouseEnter={this.onTimeShiftMouseEnter.bind(this, timeShift)}
      onMouseLeave={this.onTimeShiftMouseLeave.bind(this, timeShift)}
    >{label}</button>;
  }

  renderPresetsTimePicker() {
    const { essence, timekeeper, dimension } = this.props;
    const { timeSelection, hoverPreset, hoverTimeShift } = this.state;
    if (!dimension) return null;

    const { timezone } = essence;

    const presetToButton = (preset: Preset) => {
      return <button
        key={preset.name}
        className={classNames("preset", { hover: preset === hoverPreset, selected: preset.selection.equals(timeSelection) })}
        onClick={this.onPresetClick.bind(this, preset)}
        onMouseEnter={this.onPresetMouseEnter.bind(this, preset)}
        onMouseLeave={this.onPresetMouseLeave.bind(this, preset)}
      >{preset.name}</button>;
    };

    const maxTimeBasedPresets = <div>
      <div className="type">{STRINGS.latest}</div>
      <div className="buttons">{latestPresets.map(presetToButton)}</div>
    </div>;

    let previewTimeRange: TimeRange = null;
    if (timeSelection && timeSelection.type !== "TIME_RANGE") {
      let { value } = timeSelection as LiteralExpression;
      if (!Set.isSet(value)) throw new Error(`Unrecognized filter value ${value}`);
      if (value.size() !== 1) throw new Error("Can only filter on one time");

      let time = value.elements[0];
      previewTimeRange = makeDateIntoTimeRange(time, timezone);
    } else {
      previewTimeRange = essence.evaluateSelection(hoverPreset ? hoverPreset.selection : timeSelection, timekeeper);
    }

    const previewText = previewTimeRange ? formatTimeRange(previewTimeRange, timezone, DisplayYear.IF_DIFF) : STRINGS.noFilter;
    const timeShiftPreview = this.timeShiftPreviewForPreset(previewTimeRange);

    return <div className="cont">
      {essence.dataCube.isTimeAttribute(dimension.expression) ? maxTimeBasedPresets : null}
      <div className="type">{STRINGS.current}</div>
      <div className="buttons">{CURRENT_PRESETS.map(presetToButton)}</div>
      <div className="type">{STRINGS.previous}</div>
      <div className="buttons">{PREVIOUS_PRESETS.map(presetToButton)}</div>
      <div className="preview preview--with-spacing">{previewText}</div>
      <div className="type">{STRINGS.timeShift}</div>
      <div className="buttons">{COMPARISON_PRESETS.map(this.timeShiftToButton(this.saveTimeShift, essence.timeShift))}</div>
      {timeShiftPreview ? <div className="preview">{timeShiftPreview}</div> : null}
    </div>;
  }

  timeShiftPreviewForPreset(previewTimeRange: TimeRange) {
    const { hoverTimeShift } = this.state;
    const { essence } = this.props;

    if (hoverTimeShift && !hoverTimeShift.isEmpty()) {
      return this.shiftAndFormatTimeRange(previewTimeRange, hoverTimeShift);
    }
    if (!hoverTimeShift && essence.hasComparison()) {
      return this.shiftAndFormatTimeRange(previewTimeRange, essence.timeShift);
    }
    return null;
  }

  actionEnabled() {
    const { essence } = this.props;
    const { tab, fixedTimeShift } = this.state;
    if (tab !== TimeFilterMenu.FIXED_TAB) return false;
    const newFilter = this.constructFixedFilter();
    return (newFilter && !essence.filter.equals(newFilter)) || !essence.timeShift.equals(fixedTimeShift);
  }

  timeShiftPreviewForRange(): string {
    const { hoverTimeShift, fixedTimeShift, startTime, endTime } = this.state;
    if (startTime === null || endTime === null) {
      return null;
    }
    if (startTime > endTime) {
      return null;
    }
    const timeRange = TimeRange.fromJS({ start: startTime, end: endTime });
    if (hoverTimeShift && !hoverTimeShift.isEmpty()) {
      return this.shiftAndFormatTimeRange(timeRange, hoverTimeShift);
    }
    if (!hoverTimeShift && !fixedTimeShift.isEmpty()) {
      return this.shiftAndFormatTimeRange(timeRange, fixedTimeShift);
    }
    return null;
  }

  renderDateRangePicker() {
    const { essence, timekeeper, dimension } = this.props;
    if (!dimension) return null;
    const { fixedTimeShift, startTime, endTime } = this.state;
    const timeShiftPreview = this.timeShiftPreviewForRange();

    return <div>
      <DateRangePicker
        startTime={startTime}
        endTime={endTime}
        maxTime={essence.dataCube.getMaxTime(timekeeper)}
        timezone={essence.timezone}
        onStartChange={this.onStartChange.bind(this)}
        onEndChange={this.onEndChange.bind(this)}
      />
      <div className="cont">
        <div className="type">{STRINGS.timeShift}</div>
        <div className="buttons">{COMPARISON_PRESETS.map(this.timeShiftToButton(this.onClickTimeShift, fixedTimeShift))}</div>
        {timeShiftPreview ? <div className="preview">{timeShiftPreview}</div> : null}
      </div>
      <div className="ok-cancel-bar">
        <Button type="primary" onClick={this.onOkClick.bind(this)} disabled={!this.actionEnabled()} title={STRINGS.ok}/>
        <Button type="secondary" onClick={this.onCancelClick.bind(this)} title={STRINGS.cancel}/>
      </div>
    </div>;
  }

  render() {
    const { dimension, onClose, containerStage, openOn, inside } = this.props;
    const { tab } = this.state;
    if (!dimension) return null;
    const menuSize = Stage.fromSize(MENU_WIDTH, 410);

    const tabs = [TimeFilterMenu.RELATIVE_TAB, TimeFilterMenu.FIXED_TAB].map(name => {
      return {
        isSelected: tab === name,
        title: (name === TimeFilterMenu.RELATIVE_TAB ? STRINGS.relative : STRINGS.fixed),
        key: name,
        onClick: this.selectTab.bind(this, name)
      };
    });
    return <BubbleMenu
      className="time-filter-menu"
      direction="down"
      containerStage={containerStage}
      stage={menuSize}
      openOn={openOn}
      onClose={onClose}
      inside={inside}
    >
      <ButtonGroup groupMembers={tabs}/>
      {tab === TimeFilterMenu.RELATIVE_TAB ? this.renderPresetsTimePicker() : this.renderDateRangePicker()}
    </BubbleMenu>;
  }
}
