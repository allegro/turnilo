require('./time-input.css');

import * as React from 'react';
import { Timezone, WallTime } from 'chronoshift';

export interface TimeInputProps extends React.Props<any> {
  time: Date;
  timezone: Timezone;
  onChange: (t: Date) => void;
}

export interface TimeInputState {
  dateString?: string;
  timeString?: string;
}

export class TimeInput extends React.Component<TimeInputProps, TimeInputState> {

  constructor() {
    super();
    this.state = {
      dateString: '',
      timeString: ''
    };

  }

  // 2015-09-23T17:42:57.636Z
  // 2015-09-23 17:42

  componentDidMount() {
    var { time, timezone } = this.props;
    this.updateStateFromTime(time, timezone);
  }

  componentWillReceiveProps(nextProps: TimeInputProps) {
    var { time, timezone } = nextProps;
    this.updateStateFromTime(time, timezone);
  }

  updateStateFromTime(time: Date, timezone: Timezone) {
    if (!time) return;
    if (isNaN(time.valueOf())) {
      this.setState({
        dateString: '',
        timeString: ''
      });
      return;
    }

    var adjTime = WallTime.UTCToWallTime(time, timezone.toString());
    var timeISO = adjTime.toISOString().replace(/:\d\d(\.\d\d\d)?Z?$/, '').split('T');

    this.setState({
      dateString: timeISO[0],
      timeString: timeISO[1]
    });
  }

  dateChange(e: KeyboardEvent) {
    var { timeString } = this.state;
    var dateString = (e.target as HTMLInputElement).value.replace(/[^\d-]/g, '').substr(0, 10);
    this.setState({
      dateString
    });

    if (dateString.length === 10) {
      this.changeDate(dateString + 'T' + timeString + 'Z');
    } else {
      this.changeDate('blah');
    }
  }

  timeChange(e: KeyboardEvent) {
    var { dateString } = this.state;
    var timeString = (e.target as HTMLInputElement).value.replace(/[^\d:]/g, '').substr(0, 8);
    this.setState({
      timeString
    });

    this.changeDate(dateString + 'T' + timeString + 'Z');
  }

  changeDate(possibleDateString: string): void {
    var { timezone, onChange } = this.props;
    var possibleDate = new Date(possibleDateString);

    if (isNaN(possibleDate.valueOf())) {
      onChange(null);
    } else {
      // Convert from WallTime to UTC
      var possibleDate = WallTime.WallTimeToUTC(
        timezone.toString(),
        possibleDate.getUTCFullYear(), possibleDate.getUTCMonth(), possibleDate.getUTCDate(),
        possibleDate.getUTCHours(), possibleDate.getUTCMinutes(), possibleDate.getUTCSeconds(),
        possibleDate.getUTCMilliseconds()
      );

      onChange(possibleDate);
    }
  }

  render() {
    var { dateString, timeString } = this.state;

    return <div className="time-input">
      <input className="date" value={dateString} onChange={this.dateChange.bind(this)}/>
      <input className="time" value={timeString} onChange={this.timeChange.bind(this)}/>
    </div>;
  }
}
