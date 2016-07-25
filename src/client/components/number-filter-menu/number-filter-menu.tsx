/*
 * Copyright 2015-2016 Imply Data, Inc.
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

require('./number-filter-menu.css');

import * as React from 'react';
import { Set, NumberRange, LiteralExpression } from 'plywood';

import { FilterClause, Clicker, Essence, Filter, Dimension, FilterMode } from '../../../common/models/index';
import { Fn } from '../../../common/utils/general/general';
import { STRINGS } from '../../config/constants';
import { enterKey } from '../../utils/dom/dom';

import { Button } from '../button/button';
import { NumberRangePicker, ANY_VALUE } from '../number-range-picker/number-range-picker';
import { FilterOptionsDropdown } from '../filter-options-dropdown/filter-options-dropdown';

function numberOrAnyToString(start: number): string {
  if (start === ANY_VALUE) return STRINGS.any;
  return '' + start;
}

function stringToNumberOrAny(startInput: string): number {
  var parse = parseFloat(startInput);
  return isNaN(parse) ? ANY_VALUE : parse;
}

export interface NumberFilterMenuProps extends React.Props<any> {
  clicker: Clicker;
  essence: Essence;
  dimension: Dimension;
  onClose: Fn;
}

export interface NumberFilterMenuState {
  leftOffset?: number;
  rightBound?: number;
  start?: number;
  startInput?: string;
  end?: number;
  endInput?: string;
  significantDigits?: number;
  filterMode?: FilterMode;
}

export class NumberFilterMenu extends React.Component<NumberFilterMenuProps, NumberFilterMenuState> {
  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      leftOffset: null,
      rightBound: null,
      start: null,
      startInput: "",
      end: null,
      endInput: ""
    };

    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  componentWillMount() {
    var { essence, dimension } = this.props;

    var filter = essence.filter;
    var valueSet = filter.getLiteralSet(dimension.expression);
    var hasFilter = valueSet && valueSet.elements.length !== 0;
    var start: number = null;
    var end: number = null;

    if (hasFilter) {
      if (valueSet.setType === 'NUMBER_RANGE') {
        var range = valueSet.elements[0];
        start = range.start;
        end = range.end;
      } else if (valueSet.setType === 'NUMBER') {
        var number = valueSet.elements[0];
        start = number;
        end = number;
      }
    }

    this.setState({
      startInput: numberOrAnyToString(start),
      endInput: numberOrAnyToString(end),
      start,
      end,
      filterMode: filter.getModeForDimension(dimension) || Filter.INCLUDED
    });
  }

  componentDidMount() {
    window.addEventListener('keydown', this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.globalKeyDownListener);
  }

  constructFilter(): Filter {
    var { essence, dimension } = this.props;
    var { start, end, filterMode } = this.state;
    var { filter } = essence;

    var validFilter = false;
    if ((start !== null && end !== null)) {
      validFilter = start <= end;
    } else {
      validFilter = (!isNaN(start) && !(isNaN(end))) && (start !== null || end !== null);
    }

    if (validFilter) {

      var bounds = start === end ? '[]' : '[)';
      var newSet = Set.fromJS({ setType: "NUMBER_RANGE", elements: [NumberRange.fromJS({ start, end, bounds })] });
      var clause = new FilterClause({
        expression: dimension.expression,
        selection: new LiteralExpression({ type: "SET/NUMBER_RANGE", value: newSet }),
        exclude: filterMode === Filter.EXCLUDED
      });
      return filter.setClause(clause);
    } else {
      return null;
    }
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (enterKey(e)) {
      this.onOkClick();
    }
  }

  onOkClick() {
    if (!this.actionEnabled()) return;
    var { clicker, onClose } = this.props;
    clicker.changeFilter(this.constructFilter());
    onClose();
  }

  onCancelClick() {
    var { onClose } = this.props;
    onClose();
  }

  onRangeInputStartChange(e: KeyboardEvent) {
    var startInput = (e.target as HTMLInputElement).value;
    this.setState({
      startInput,
      start: stringToNumberOrAny(startInput)
    });
  }

  onRangeInputEndChange(e: KeyboardEvent) {
    var endInput = (e.target as HTMLInputElement).value;
    this.setState({
      endInput,
      end: stringToNumberOrAny(endInput)
    });
  }

  onRangeStartChange(newStart: number) {
    this.setState({ startInput: numberOrAnyToString(newStart), start: newStart });
  }

  onRangeEndChange(newEnd: number) {
    this.setState({ endInput: numberOrAnyToString(newEnd), end: newEnd });
  }

  onSelectFilterOption(filterMode: FilterMode) {
    this.setState({filterMode});
  }

  actionEnabled() {
    var { essence } = this.props;
    return !essence.filter.equals(this.constructFilter()) && Boolean(this.constructFilter());
  }

  render() {
    const { essence, dimension } = this.props;
    const { endInput, startInput, end, start, filterMode } = this.state;

    return <div className="number-filter-menu" ref="number-filter-menu">
      <div className="side-by-side">
        <div className="group">
          <label className="input-top-label">Type</label>
          <FilterOptionsDropdown
            selectedOption={filterMode}
            onSelectOption={this.onSelectFilterOption.bind(this)}
          />
        </div>
        <div className="group">
          <label className="input-top-label">Min</label>
          <input value={startInput} onChange={this.onRangeInputStartChange.bind(this)} />
        </div>
        <div className="group">
          <label className="input-top-label">Max</label>
          <input value={endInput} onChange={this.onRangeInputEndChange.bind(this)} />
        </div>
      </div>

      <NumberRangePicker
        onRangeEndChange={this.onRangeEndChange.bind(this)}
        onRangeStartChange={this.onRangeStartChange.bind(this)}
        start={start}
        end={end}
        dimension={dimension}
        essence={essence}
      />

      <div className="button-bar">
        <Button type="primary" title={STRINGS.ok} onClick={this.onOkClick.bind(this)} disabled={!this.actionEnabled()} />
        <Button type="secondary" title={STRINGS.cancel} onClick={this.onCancelClick.bind(this)} />
      </div>
    </div>;
  }
}
