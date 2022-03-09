/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { List } from "immutable";
import React from "react";
import { Dimension } from "../../../../common/models/dimension/dimension";
import { Essence } from "../../../../common/models/essence/essence";
import { FilterClause, NumberFilterClause, NumberRange } from "../../../../common/models/filter-clause/filter-clause";
import { FilterMode } from "../../../../common/models/filter/filter";
import { Stage } from "../../../../common/models/stage/stage";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { Unary } from "../../../../common/utils/functional/functional";
import { Fn } from "../../../../common/utils/general/general";
import { STRINGS } from "../../../config/constants";
import { enterKey } from "../../../utils/dom/dom";
import { BubbleMenu } from "../../bubble-menu/bubble-menu";
import { Button } from "../../button/button";
import { FilterOption, FilterOptionsDropdown } from "../../filter-options-dropdown/filter-options-dropdown";
import { ANY_VALUE, NumberRangePicker } from "../../number-range-picker/number-range-picker";
import "./number-filter-menu.scss";

function numberOrAnyToString(start: number): string {
  if (start === ANY_VALUE) return STRINGS.any;
  return "" + start;
}

function stringToNumberOrAny(startInput: string): number {
  const parse = parseFloat(startInput);
  return isNaN(parse) ? ANY_VALUE : parse;
}

const MENU_WIDTH = 250;
const filterOptions: FilterOption[] = FilterOptionsDropdown.getFilterOptions(FilterMode.INCLUDE, FilterMode.EXCLUDE);

export interface NumberFilterMenuProps {
  essence: Essence;
  timekeeper: Timekeeper;
  dimension: Dimension;
  saveClause: Unary<FilterClause, void>;
  onClose: Fn;
  containerStage?: Stage;
  openOn: Element;
}

export interface NumberFilterMenuState {
  leftOffset?: number;
  rightBound?: number;
  start?: number;
  end?: number;
  significantDigits?: number;
  filterMode?: FilterMode;
}

export class NumberFilterMenu extends React.Component<NumberFilterMenuProps, NumberFilterMenuState> {
  state: NumberFilterMenuState = {
    leftOffset: null,
    rightBound: null,
    start: ANY_VALUE,
    end: ANY_VALUE
  };

  UNSAFE_componentWillMount() {
    const { essence, dimension } = this.props;
    const clause = essence.filter.getClauseForDimension(dimension);
    if (!clause) return;
    if (!(clause instanceof NumberFilterClause)) {
      throw new Error(`Expected number filter. Got: ${clause}`);
    }
    const hasFilter = clause.values.count() !== 0;
    if (hasFilter) {
      const { start, end } = clause.values.first();

      this.setState({
        start,
        end,
        filterMode: essence.filter.getModeForDimension(dimension) || FilterMode.INCLUDE
      });
    }
  }

  componentDidMount() {
    window.addEventListener("keydown", this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.globalKeyDownListener);
  }

  constructClause(): NumberFilterClause {
    const { dimension } = this.props;
    const { start, end, filterMode } = this.state;

    if (isNaN(start) || isNaN(end)) return null;
    if (start === null && end === null) return null;
    if (start !== null && end !== null && start > end) return null;
    return new NumberFilterClause({
      reference: dimension.name,
      not: filterMode === FilterMode.EXCLUDE,
      values: List.of(new NumberRange({ start, end, bounds: start === end ? "[]" : "[)" }))
    });
  }

  globalKeyDownListener = (e: KeyboardEvent) => {
    if (enterKey(e)) {
      this.onOkClick();
    }
  };

  onOkClick = () => {
    if (!this.actionEnabled()) return;
    const { saveClause, onClose } = this.props;
    saveClause(this.constructClause());
    onClose();
  };

  onCancelClick = () => {
    const { onClose } = this.props;
    onClose();
  };

  onRangeInputStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startInput = e.target.value;
    this.setState({
      start: stringToNumberOrAny(startInput)
    });
  };

  onRangeInputEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const endInput = e.target.value;
    this.setState({
      end: stringToNumberOrAny(endInput)
    });
  };

  onRangeStartChange = (start: number) => {
    this.setState({ start });
  };

  onRangeEndChange = (end: number) => {
    this.setState({ end });
  };

  onSelectFilterOption = (filterMode: FilterMode) => {
    this.setState({ filterMode });
  };

  actionEnabled() {
    const { essence: { filter }, dimension } = this.props;
    const newClause = this.constructClause();
    const oldClause = filter.getClauseForDimension(dimension);
    return Boolean(newClause) && !newClause.equals(oldClause);
  }

  render() {
    const { essence, timekeeper, dimension, onClose, containerStage, openOn } = this.props;
    const { end, start, filterMode } = this.state;
    const menuSize = Stage.fromSize(MENU_WIDTH, 410);

    return <BubbleMenu
      className="number-filter-menu"
      direction="down"
      containerStage={containerStage}
      stage={menuSize}
      openOn={openOn}
      onClose={onClose}
    >
      <div className="side-by-side">
        <div className="group">
          <label className="input-top-label">Type</label>
          <FilterOptionsDropdown
            selectedOption={filterMode}
            onSelectOption={this.onSelectFilterOption}
            filterOptions={filterOptions}
          />
        </div>
        <div className="group">
          <label className="input-top-label">Min</label>
          <input value={numberOrAnyToString(start)} onChange={this.onRangeInputStartChange} />
        </div>
        <div className="group">
          <label className="input-top-label">Max</label>
          <input value={numberOrAnyToString(end)} onChange={this.onRangeInputEndChange} />
        </div>
      </div>

      <NumberRangePicker
        onRangeEndChange={this.onRangeEndChange}
        onRangeStartChange={this.onRangeStartChange}
        start={start}
        end={end}
        dimension={dimension}
        essence={essence}
        timekeeper={timekeeper}
        exclude={filterMode === FilterMode.EXCLUDE}
      />

      <div className="ok-cancel-bar">
        <Button type="primary" title={STRINGS.ok} onClick={this.onOkClick} disabled={!this.actionEnabled()} />
        <Button type="secondary" title={STRINGS.cancel} onClick={this.onCancelClick} />
      </div>
    </BubbleMenu>;
  }
}
