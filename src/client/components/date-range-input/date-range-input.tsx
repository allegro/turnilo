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

require('./date-range-input.css');

import * as React from 'react';
import { Timezone, WallTime } from 'chronoshift';
import { getWallTimeString, exclusiveToInclusiveEnd } from '../../../common/utils/time/time';

export interface DateRangeInputProps extends React.Props<any> {
  time: Date;
  timezone: Timezone;
  onChange: (t: Date) => void;
  hide?: boolean;
  type?: string;
}

export interface DateRangeInputState {
  dateString?: string;
}

export class DateRangeInput extends React.Component<DateRangeInputProps, DateRangeInputState> {

  constructor() {
    super();
    this.state = {
      dateString: ''
    };
  }

  // 2015-09-23T17:42:57.636Z
  // 2015-09-23 17:42

  componentDidMount() {
    var { time, timezone } = this.props;
    this.updateStateFromTime(time, timezone);
  }

  componentWillReceiveProps(nextProps: DateRangeInputProps) {
    var { time, timezone } = nextProps;
    this.updateStateFromTime(time, timezone);
  }

  updateStateFromTime(time: Date, timezone: Timezone) {
    if (!time) return;
    if (isNaN(time.valueOf())) {
      this.setState({
        dateString: ''
      });
      return;
    }

    const effectiveTime = this.props.type === "end" ? exclusiveToInclusiveEnd(time) : time;

    this.setState({
      dateString: getWallTimeString(effectiveTime, timezone)
    });
  }

  dateChange(e: KeyboardEvent) {
    var dateString = (e.target as HTMLInputElement).value.replace(/[^\d-]/g, '').substr(0, 10);
    this.setState({
      dateString
    });

    if (dateString.length === 10) {
      this.changeDate(dateString);
    }
  }

  changeDate(possibleDateString: string): void {
    var { timezone, onChange, type } = this.props;
    var possibleDate = new Date(possibleDateString);
    // add one if end so it passes the inclusive formatting
    var day = type === "end" ? possibleDate.getUTCDate() + 1 : possibleDate.getUTCDate();

    if (isNaN(possibleDate.valueOf())) {
      onChange(null);
    } else {
      // Convert from WallTime to UTC
      var possibleDate = WallTime.WallTimeToUTC(
        timezone.toString(),
        possibleDate.getUTCFullYear(), possibleDate.getUTCMonth(), day,
        possibleDate.getUTCHours(), possibleDate.getUTCMinutes(), possibleDate.getUTCSeconds(),
        possibleDate.getUTCMilliseconds()
      );

      onChange(possibleDate);
    }
  }

  render() {
    const { hide } = this.props;
    const { dateString } = this.state;
    const value = hide ? '' : dateString;

    return <div className="date-range-input">
      <input className="input-field" value={value} onChange={this.dateChange.bind(this)}/>
    </div>;
  }
}
