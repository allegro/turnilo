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

require('./notification-card.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { STRINGS } from '../../config/constants';
import { classNames, clamp } from '../../utils/dom/dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { BodyPortal } from '../body-portal/body-portal';

import { Notifier, Notification } from './notifications';

export interface NotificationCardProps extends React.Props<any> {
  model: Notification;
  top: number;
}

export interface NotificationCardState {
  appearing?: boolean;
  disappearing?: boolean;
  hovered?: boolean;
  timerExpired?: boolean;
}

const DEFAULT_DURATION = 6; // seconds

export class NotificationCard extends React.Component<NotificationCardProps, NotificationCardState> {
  private timeoutID: number;

  constructor() {
    super();
    this.state = {
      appearing: false,
      disappearing: false,
      hovered: false,
      timerExpired: false
    };
  }

  componentDidMount() {
    this.setState({appearing: true}, () => {
      this.timeoutID = window.setTimeout(this.appear.bind(this), 10);
    });
  }

  componentWillReceiveProps(nextProps: NotificationCardProps) {
    if (nextProps.model && nextProps.model.discarded) {
      this.disappear();
    }
  }

  appear() {
    const { title, message, duration, muted } = this.props.model;

    var d = clamp(duration, -1, 10);

    if (d === -1) {
      this.setState({appearing: false});
      return;
    }

    if (muted) {
      this.setState({appearing: false});
    } else {
      this.setState({appearing: false}, () => {
        this.timeoutID = window.setTimeout(this.onDisappearTimerEnd.bind(this), (d ? d : DEFAULT_DURATION) * 1000 );
      });
    }
  }

  onDisappearTimerEnd() {
    if (this.state.hovered) {
      this.setState({
        timerExpired: true
      });

      return;
    }

    this.disappear();
  }

  disappear() {
    if (this.timeoutID !== undefined) window.clearTimeout(this.timeoutID);

    this.setState({disappearing: true}, () => {
      this.timeoutID = window.setTimeout(this.removeMe.bind(this, this.props.model), 200);
    });
  }

  removeMe(notification: Notification) {
    if (this.timeoutID !== undefined) window.clearTimeout(this.timeoutID);
    Notifier.removeNotification(notification);
  }

  componentWillUnmount() {
    if (this.timeoutID !== undefined) window.clearTimeout(this.timeoutID);
  }

  onMouseOver() {
    this.setState({
      hovered: true
    });
  }

  onMouseLeave() {
    this.setState({
      hovered: false
    });

    if (this.state.timerExpired) {
      this.disappear();
    }
  }

  render() {
    const { appearing, disappearing } = this.state;
    var { model, top } = this.props;

    if (!model) return null;

    const { title, message, priority, action, muted } = model;

    if (appearing || disappearing) top = -100;

    var rowsClass = `rows-${[title, message, action].filter(Boolean).length}`;

    var onClick = () => {
      action && action.callback();
      this.disappear();
    };

    return <div
      style={{top}}
      onClick={onClick}
      onMouseOver={this.onMouseOver.bind(this)}
      onMouseLeave={this.onMouseLeave.bind(this)}
      className={classNames(`notification-card ${priority} ${rowsClass}`, {appearing, disappearing, muted})}
     >
      <div className="title">{title}</div>
      { message ? <div className="message">{message}</div> : null }
      { action ? <div className="action"><span>{action.label}</span></div> : null }
    </div>;
  }
}
