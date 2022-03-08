/*
 * Copyright 2017-2019 Allegro.pl
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

import { Duration } from "chronoshift";
import React from "react";
import { Clicker } from "../../../../common/models/clicker/clicker";
import { isTimeAttribute } from "../../../../common/models/data-cube/data-cube";
import { TimeDimension } from "../../../../common/models/dimension/dimension";
import { Essence } from "../../../../common/models/essence/essence";
import {
  FilterClause,
  RelativeTimeFilterClause,
  TimeFilterPeriod
} from "../../../../common/models/filter-clause/filter-clause";
import { isValidTimeShift, TimeShift } from "../../../../common/models/time-shift/time-shift";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { Unary } from "../../../../common/utils/functional/functional";
import { Fn } from "../../../../common/utils/general/general";
import { isValidDuration } from "../../../../common/utils/plywood/duration";
import { formatTimeRange } from "../../../../common/utils/time/time";
import { STRINGS } from "../../../config/constants";
import { ButtonGroup } from "../../button-group/button-group";
import { Button } from "../../button/button";
import { Preset } from "../../input-with-presets/input-with-presets";
import { StringInputWithPresets } from "../../input-with-presets/string-input-with-presets";
import { getTimeFilterPresets, normalizeDurationName } from "./presets";
import { TimeShiftSelector } from "./time-shift-selector";

export interface PresetTimeTabProps {
  essence: Essence;
  timekeeper: Timekeeper;
  dimension: TimeDimension;
  clicker: Clicker;
  saveClause: Unary<FilterClause, void>;
  onClose: Fn;
}

export interface PresetTimeTabState {
  filterPeriod: TimeFilterPeriod;
  filterDuration: string;
  timeShift: string;
}

function initialState(essence: Essence, dimension: TimeDimension): PresetTimeTabState {
  const filterClause = essence.filter.getClauseForDimension(dimension);
  const timeShift = essence.timeShift.toJS();
  if (filterClause instanceof RelativeTimeFilterClause) {
    const { duration, period } = filterClause;
    return { timeShift, filterDuration: duration.toJS(), filterPeriod: period };
  }
  return {
    filterPeriod: null,
    filterDuration: null,
    timeShift
  };
}

export class PresetTimeTab extends React.Component<PresetTimeTabProps, PresetTimeTabState> {

  setFilter = (filterPeriod: TimeFilterPeriod, filterDuration: string) => this.setState({ filterDuration, filterPeriod });

  setTimeShift = (timeShift: string) => this.setState({ timeShift });

  state: PresetTimeTabState = initialState(this.props.essence, this.props.dimension);

  saveTimeFilter = () => {
    if (!this.validate()) return;
    const { clicker, saveClause, onClose } = this.props;
    saveClause(this.constructRelativeClause());
    clicker.changeComparisonShift(this.constructTimeShift());
    onClose();
  };

  constructTimeShift(): TimeShift {
    return TimeShift.fromJS(this.state.timeShift);
  }

  constructRelativeClause(): RelativeTimeFilterClause | null {
    const { dimension: { name: reference } } = this.props;
    const { filterPeriod: period, filterDuration } = this.state;
    if (!isValidDuration(filterDuration)) return null;
    const duration = Duration.fromJS(filterDuration);
    return new RelativeTimeFilterClause({ period, duration, reference });
  }

  doesTimeShiftOverlap(): boolean {
    const timeShift = this.constructTimeShift();
    if (timeShift.isEmpty()) return false;
    const timeShiftDuration = timeShift.valueOf();
    const filterDuration = Duration.fromJS(this.state.filterDuration);
    return filterDuration.getCanonicalLength() > timeShiftDuration.getCanonicalLength();
  }

  isTimeShiftValid(): boolean {
    return isValidTimeShift(this.state.timeShift);
  }

  isDurationValid(): boolean {
    return isValidDuration(this.state.filterDuration);
  }

  validateOverlap(): string | null {
    const periodOverlaps = this.isTimeShiftValid() && this.isDurationValid() && this.doesTimeShiftOverlap();
    return periodOverlaps ? STRINGS.overlappingPeriods : null;
  }

  isFormValid(): boolean {
    const { filterPeriod } = this.state;
    return filterPeriod && this.isDurationValid() && this.isTimeShiftValid() && !this.doesTimeShiftOverlap();
  }

  isFilterDifferent(): boolean {
    const { essence: { filter, timeShift }, dimension } = this.props;
    const newTimeShift = this.constructTimeShift();
    const oldClause = filter.getClauseForDimension(dimension);
    const newClause = this.constructRelativeClause();
    return !oldClause.equals(newClause) || !timeShift.equals(newTimeShift);
  }

  validate(): boolean {
    return this.isFormValid() && this.isFilterDifferent();
  }

  private renderLatestPresets() {
    const { dimension } = this.props;
    const { filterDuration, filterPeriod } = this.state;
    const presets: Array<Preset<string>> = dimension.latestPeriodDurations.map(duration => {
      return {
        name: normalizeDurationName(duration.toJS()),
        identity: duration.toJS()
      };
    });

    const latestPeriod = filterPeriod === TimeFilterPeriod.LATEST;
    return <StringInputWithPresets
      title={STRINGS.latest}
      presets={presets}
      errorMessage={latestPeriod && !isValidDuration(filterDuration) && STRINGS.invalidDurationFormat}
      selected={latestPeriod ? filterDuration : undefined}
      onChange={(duration: string) => this.setFilter(TimeFilterPeriod.LATEST, duration)}
      placeholder={STRINGS.durationsExamples} />;
  }

  private renderButtonGroup(title: string, period: TimeFilterPeriod.CURRENT | TimeFilterPeriod.PREVIOUS) {
    const { filterDuration, filterPeriod } = this.state;
    const activePeriod = period === filterPeriod;
    const presets = getTimeFilterPresets(period);
    const groupMembers = presets.map(({ duration, name }) => {
      return {
        title: name,
        key: name,
        isSelected: activePeriod && filterDuration === duration,
        onClick: () => this.setFilter(period, duration)
      };
    });
    return <ButtonGroup title={title} groupMembers={groupMembers} />;
  }

  private getFilterRange() {
    const filter = this.constructRelativeClause();
    if (!filter) return null;
    const { essence, timekeeper } = this.props;
    const fixedFilter = essence.evaluateSelection(filter, timekeeper);
    return fixedFilter.values.get(0);
  }

  render() {
    const { essence, dimension } = this.props;
    if (!dimension) return null;

    const { timeShift } = this.state;

    const { timezone } = essence;

    const previewFilter = this.getFilterRange();
    const previewText = previewFilter ? formatTimeRange(previewFilter, timezone) : STRINGS.noFilter;
    const overlapError = this.validateOverlap();

    return <div className="cont">
      {isTimeAttribute(essence.dataCube, dimension.expression) && this.renderLatestPresets()}
      {this.renderButtonGroup(STRINGS.current, TimeFilterPeriod.CURRENT)}
      {this.renderButtonGroup(STRINGS.previous, TimeFilterPeriod.PREVIOUS)}
      <div className="preview preview--with-spacing">{previewText}</div>
      <TimeShiftSelector
        dimension={dimension}
        shift={timeShift}
        time={previewFilter}
        timezone={essence.timezone}
        onShiftChange={this.setTimeShift} />
      {overlapError && <div className="overlap-error-message">{overlapError}</div>}
      <div className="ok-cancel-bar">
        <Button type="primary" onClick={this.saveTimeFilter} disabled={!this.validate()} title={STRINGS.ok} />
        <Button type="secondary" onClick={this.props.onClose} title={STRINGS.cancel} />
      </div>
    </div>;
  }
}
