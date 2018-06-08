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

import { Timezone } from "chronoshift";
import "moment-timezone";
import * as React from "react";
import {
  combineDateAndTimeIntoMoment,
  getWallTimeDateOnlyString,
  getWallTimeTimeOnlyString,
  maybeFullyDefinedDate,
  maybeFullyDefinedTime
} from "../../../common/utils";
import "./date-range-input.scss";

export interface DateRangeInputProps {
  time: Date;
  timezone: Timezone;
  onChange: (t: Date) => void;
  hide?: boolean;
  type?: string;
  label: string;
}

export interface DateRangeInputState {
  dateString?: string;
  timeString?: string;
}

export class DateRangeInput extends React.Component<DateRangeInputProps, DateRangeInputState> {

  constructor(props: DateRangeInputProps) {
    super(props);
    this.state = {
      dateString: "",
      timeString: ""
    };
  }

  componentDidMount() {
    const { time, timezone } = this.props;
    this.updateStateFromTime(time, timezone);
  }

  componentWillReceiveProps(nextProps: DateRangeInputProps) {
    const { time, timezone } = nextProps;
    this.updateStateFromTime(time, timezone);
  }

  updateStateFromTime(time: Date, timezone: Timezone) {
    if (!time) return;
    if (isNaN(time.valueOf())) {
      this.setState({
        dateString: ""
      });
      return;
    }

    this.setState({
      dateString: getWallTimeDateOnlyString(time, timezone),
      timeString: getWallTimeTimeOnlyString(time, timezone)
    });
  }

  dateChange(e: KeyboardEvent) {
    const dateString = (e.target as HTMLInputElement).value.replace(/[^\d-]/g, "");
    this.setState({
      dateString
    });
    if (maybeFullyDefinedDate(dateString)) {
      this.changeDate(dateString, this.state.timeString);
    }
  }

  timeChange(e: KeyboardEvent) {
    const timeString = (e.target as HTMLInputElement).value.replace(/[^\d:]/g, "");
    this.setState({
      timeString
    });
    if (maybeFullyDefinedTime(timeString)) {
      this.changeDate(this.state.dateString, timeString);
    }
  }

  changeDate(possibleDateString: string, possibleTimeString: string): void {
    const { timezone, onChange } = this.props;

    const possibleMoment = combineDateAndTimeIntoMoment(possibleDateString, possibleTimeString, timezone);
    if (possibleMoment && possibleMoment.isValid()) {
      onChange(possibleMoment.toDate());
    }
  }

  render() {
    const { hide } = this.props;
    const { dateString, timeString } = this.state;
    const dateValue = hide ? "" : dateString;
    const timeValue = hide ? "" : timeString;

    return <div className="date-range-input">
      <div className="label">{this.props.label}</div>
      <input placeholder="YYYY-MM-DD" className="date-field" value={dateValue} onChange={this.dateChange.bind(this)} />
      <input placeholder="HH:MM" className="time-field" value={timeValue} onChange={this.timeChange.bind(this)} />
    </div>;
  }
}
