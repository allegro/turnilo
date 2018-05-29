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

import "./time-filter-menu.scss";

import { day, second, Timezone } from "chronoshift";
import { $, Expression, LiteralExpression, r, Range, Set, TimeRange } from "plywood";
import * as React from "react";
import { Stage } from "../../../common/models";
import { Clicker, Dimension, Essence, Filter, FilterClause, Timekeeper } from "../../../common/models";
import { Fn } from "../../../common/utils";
import { DisplayYear, formatTimeRange } from "../../../common/utils";
import { STRINGS } from "../../config/constants";
import { classNames, enterKey } from "../../utils/dom/dom";
import { BubbleMenu } from "../bubble-menu/bubble-menu";
import { ButtonGroup } from "../button-group/button-group";
import { Button } from "../button/button";
import { DateRangePicker } from "../date-range-picker/date-range-picker";

function makeDateIntoTimeRange(input: Date, timezone: Timezone): TimeRange {
  return new TimeRange({ start: second.shift(input, timezone, - 1), end: second.shift(input, timezone, 1) });
}

export interface Preset {
  name: string;
  selection: Expression;
}

const $maxTime = $(FilterClause.MAX_TIME_REF_NAME);
const latestPresets: Preset[] = [
  { name: "1H",  selection: $maxTime.timeRange("PT1H", -1) },
  { name: "6H",  selection: $maxTime.timeRange("PT6H", -1) },
  { name: "1D",  selection: $maxTime.timeRange("P1D", -1)  },
  { name: "7D",  selection: $maxTime.timeRange("P1D", -7)  },
  { name: "30D", selection: $maxTime.timeRange("P1D", -30) }
];

const $now = $(FilterClause.NOW_REF_NAME);
const currentPresets: Preset[] = [
  { name: "D", selection: $now.timeFloor("P1D").timeRange("P1D", 1) },
  { name: "W", selection: $now.timeFloor("P1W").timeRange("P1W", 1) },
  { name: "M", selection: $now.timeFloor("P1M").timeRange("P1M", 1) },
  { name: "Q", selection: $now.timeFloor("P3M").timeRange("P3M", 1) },
  { name: "Y", selection: $now.timeFloor("P1Y").timeRange("P1Y", 1) }
];

const previousPresets: Preset[] = [
  { name: "D", selection: $now.timeFloor("P1D").timeRange("P1D", -1) },
  { name: "W", selection: $now.timeFloor("P1W").timeRange("P1W", -1) },
  { name: "M", selection: $now.timeFloor("P1M").timeRange("P1M", -1) },
  { name: "Q", selection: $now.timeFloor("P3M").timeRange("P3M", -1) },
  { name: "Y", selection: $now.timeFloor("P1Y").timeRange("P1Y", -1) }
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
      hoverPreset: null
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

  constructFilter(): Filter {
    let { tab, startTime, endTime } = this.state;
    const { essence, dimension } = this.props;
    const { filter } = essence;
    const { timezone } = essence;

    if (tab !== TimeFilterMenu.FIXED_TAB) return null;

    if (startTime && !endTime) {
      endTime = day.shift(startTime, timezone, 1);
    }

    if (startTime && endTime && startTime < endTime) {
      return filter.setSelection(dimension.expression, r(TimeRange.fromJS({ start: startTime, end: endTime })));
    } else {
      return null;
    }
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
    const newFilter = this.constructFilter();
    if (!newFilter) return;
    clicker.changeFilter(newFilter);
    onClose();
  }

  onCancelClick() {
    const { onClose } = this.props;
    onClose();
  }

  renderPresetsTimePicker() {
    const { essence, timekeeper, dimension } = this.props;
    const { timeSelection, hoverPreset } = this.state;
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
    const maxTimeBasedPresets = <div>
      <div className="type">{STRINGS.latest}</div>
      <div className="buttons">{latestPresets.map(presetToButton)}</div>
    </div>;

    return <div className="cont">
      {essence.dataCube.isTimeAttribute(dimension.expression) ? maxTimeBasedPresets : null}
      <div className="type">{STRINGS.current}</div>
      <div className="buttons">{currentPresets.map(presetToButton)}</div>
      <div className="type">{STRINGS.previous}</div>
      <div className="buttons">{previousPresets.map(presetToButton)}</div>
      <div className="preview">{previewText}</div>
    </div>;
  }

  actionEnabled() {
    const { essence } = this.props;
    const { tab } = this.state;
    if (tab !== TimeFilterMenu.FIXED_TAB) return false;
    const newFilter = this.constructFilter();
    return newFilter && !essence.filter.equals(newFilter);
  }

  renderDateRangePicker() {
    const { essence, timekeeper, dimension } = this.props;
    const { startTime, endTime } = this.state;
    if (!dimension) return null;

    return <div>
      <DateRangePicker
        startTime={startTime}
        endTime={endTime}
        maxTime={essence.dataCube.getMaxTime(timekeeper)}
        timezone={essence.timezone}
        onStartChange={this.onStartChange.bind(this)}
        onEndChange={this.onEndChange.bind(this)}
      />
      <div className="ok-cancel-bar">
        <Button type="primary" onClick={this.onOkClick.bind(this)} disabled={!this.actionEnabled()} title={STRINGS.ok} />
        <Button type="secondary" onClick={this.onCancelClick.bind(this)} title={STRINGS.cancel} />
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
      <ButtonGroup groupMembers={tabs} />
      {tab === TimeFilterMenu.RELATIVE_TAB ? this.renderPresetsTimePicker() : this.renderDateRangePicker()}
    </BubbleMenu>;
  }
}
