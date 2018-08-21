/*
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

import { second } from "chronoshift";
import { LiteralExpression, Set, TimeRange, TimeRangeExpression } from "plywood";
import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { TimeShift, isValidTimeShift } from "../../../common/models/time-shift/time-shift";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { Fn } from "../../../common/utils/general/general";
import { isValidDuration } from "../../../common/utils/plywood/duration";
import { DisplayYear, formatTimeRange } from "../../../common/utils/time/time";
import { STRINGS } from "../../config/constants";
import { ButtonGroup, GroupMember } from "../button-group/button-group";
import { Button } from "../button/button";
import { InputWithPresets } from "../input-with-presets/input-with-presets";
import { constructFilter, getFilterPeriod, getTimeFilterPresets, LATEST_PRESETS, TimeFilterPeriod, TimeFilterPreset } from "./presets";
import { TimeShiftSelector } from "./time-shift-selector";

export interface PresetTimeTabProps {
  essence: Essence;
  timekeeper: Timekeeper;
  dimension: Dimension;
  clicker: Clicker;
  onClose: Fn;
}

export interface PresetTimeTabState {
  filterPeriod: TimeFilterPeriod;
  filterDuration: string;
  timeShift: string;
}

function initialState(essence: Essence, dimension: Dimension): PresetTimeTabState {
  const filterClause = essence.filter.getClausesForDimension(dimension).get(0);
  const filterSelection = essence.filter.getSelection(dimension.expression) as TimeRangeExpression;
  return {
    timeShift: essence.timeShift.toJS(),
    filterPeriod: getFilterPeriod(filterClause),
    filterDuration: filterSelection.duration.toJS()
  };
}

export class PresetTimeTab extends React.Component<PresetTimeTabProps, PresetTimeTabState> {

  setFilter = (filterPeriod: TimeFilterPeriod, filterDuration: string) => this.setState(state => ({ ...state, filterDuration, filterPeriod }));

  setTimeShift = (timeShift: string) => this.setState(state => ({ ...state, timeShift }));

  state: PresetTimeTabState = initialState(this.props.essence, this.props.dimension);

  saveTimeFilter = () => {
    if (!this.validate()) return;
    const { clicker, onClose, essence, dimension } = this.props;
    const { filterPeriod, filterDuration, timeShift } = this.state;
    clicker.changeFilter(essence.filter.setSelection(dimension.expression, constructFilter(filterPeriod, filterDuration)));
    clicker.changeComparisonShift(TimeShift.fromJS(timeShift));
    onClose();
  }

  validate(): boolean {
    const { timeShift, filterDuration } = this.state;
    return isValidTimeShift(timeShift) && isValidDuration(filterDuration);
  }

  private renderLatestPresets() {
    const { filterDuration, filterPeriod } = this.state;
    const presets = LATEST_PRESETS.map(({ name, duration }: TimeFilterPreset) => {
      return { name, identity: duration };
    });

    const latestPeriod = filterPeriod === TimeFilterPeriod.LATEST;
    return <InputWithPresets
      title={STRINGS.latest}
      presets={presets}
      errorMessage={latestPeriod && !isValidDuration(filterDuration) && "Invalid format"}
      selected={latestPeriod ? filterDuration : undefined}
      onChange={(duration: string) => this.setFilter(TimeFilterPeriod.LATEST, duration)}
      placeholder={STRINGS.latest}/>;
  }

  private renderButtonGroup(title: string, period: TimeFilterPeriod) {
    const { filterDuration, filterPeriod } = this.state;
    const activePeriod = period === filterPeriod;
    const presets = getTimeFilterPresets(period);
    const groupMembers: GroupMember[] = presets.map(({ duration, name }) => {
      return {
        title: name,
        key: name,
        isSelected: activePeriod && filterDuration === duration,
        onClick: () => this.setFilter(period, duration)
      };
    });
    return <ButtonGroup title={title} groupMembers={groupMembers}/>;
  }

  private getPreviewTimeRange() {
    const { filterPeriod, filterDuration } = this.state;
    if (!isValidDuration(filterDuration)) return null;
    const preset = constructFilter(filterPeriod, filterDuration);
    if (!preset) return null;

    const { essence, timekeeper } = this.props;
    if (preset && preset.type !== "TIME_RANGE") {
      let { value } = preset as LiteralExpression;
      if (!Set.isSet(value)) throw new Error(`Unrecognized filter value ${value}`);
      if (value.size() !== 1) throw new Error("Can only filter on one time");

      return new TimeRange({
        start: second.shift(value.elements[0], essence.timezone, -1),
        end: second.shift(value.elements[0], essence.timezone, 1)
      });
    }
    return essence.evaluateSelection(preset, timekeeper);
  }

  render() {
    const { essence, dimension } = this.props;
    if (!dimension) return null;

    const { timeShift } = this.state;

    const { timezone } = essence;

    const previewTimeRange = this.getPreviewTimeRange();
    const previewText = previewTimeRange ? formatTimeRange(previewTimeRange, timezone, DisplayYear.IF_DIFF) : STRINGS.noFilter;

    return <div className="cont">
      {essence.dataCube.isTimeAttribute(dimension.expression) && this.renderLatestPresets()}
      {this.renderButtonGroup(STRINGS.current, TimeFilterPeriod.CURRENT)}
      {this.renderButtonGroup(STRINGS.previous, TimeFilterPeriod.PREVIOUS)}
      <div className="preview preview--with-spacing">{previewText}</div>
      <TimeShiftSelector
        shift={timeShift}
        time={previewTimeRange}
        timezone={essence.timezone}
        shiftValue={isValidTimeShift(timeShift) ? TimeShift.fromJS(timeShift) : null}
        errorMessage={!isValidTimeShift(timeShift) && "Invalid format"}
        onShiftChange={this.setTimeShift}/>
      <div className="ok-cancel-bar">
        <Button type="primary" onClick={this.saveTimeFilter} disabled={!this.validate()} title={STRINGS.ok}/>
        <Button type="secondary" onClick={this.props.onClose} title={STRINGS.cancel}/>
      </div>
    </div>;
  }

}
