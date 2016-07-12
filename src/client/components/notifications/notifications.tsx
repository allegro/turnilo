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

require('./notifications.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { classNames } from '../../utils/dom/dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { BodyPortal } from '../body-portal/body-portal';
import { NotificationCard } from './notification-card';

export interface Notification {
  title: string;
  priority: string;
  message: string;
  id?: number;
  sticky?: boolean;
}

export class Notifier {
  static counter = 0;
  static notifications: Notification[] = [];
  static listeners: ((notifications: Notification[]) => void)[] = [];

  private static create(notification: Notification) {
    notification.id = Notifier.counter++;

    Notifier.notifications.push(notification);
    Notifier.listeners.forEach((cb) => cb(Notifier.notifications));
  }

  public static info(title: string, message?: string) {
    Notifier.create({title, message, priority: 'info'});
  }

  public static failure(title: string, message?: string) {
    Notifier.create({title, message, priority: 'failure'});
  }

  public static success(title: string, message?: string) {
    Notifier.create({title, message, priority: 'success'});
  }

  public static subscribe(callback: (notifications: Notification[]) => void) {
    Notifier.listeners.push(callback);
  }

  public static removeNotification(notification: Notification) {
    const index = Notifier.notifications.indexOf(notification);

    if (index === -1) {
      throw new Error('Trying to remove an unknown notification');
    }

    Notifier.notifications.splice(index, 1);
    Notifier.listeners.forEach((cb) => cb(Notifier.notifications));
  }

  public static unsubscribe(callback: (notifications: Notification[]) => void) {
    const index = Notifier.listeners.indexOf(callback);

    if (index === -1) {
      throw new Error('Trying to unsubscribe something that never subscribed');
    }

    Notifier.listeners.splice(index, 1);
  }
}

export interface NotificationsProps extends React.Props<any> {
}

export interface NotificationsState {
  notifications: Notification[];
}

export class Notifications extends React.Component<NotificationsProps, NotificationsState> {
  constructor() {
    super();
    this.state = {notifications: []};
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    Notifier.subscribe(this.onChange);
  }

  componentWillUnmount() {
    Notifier.unsubscribe(this.onChange);
  }

  onChange(notifications: Notification[]) {
    this.setState({notifications});
  }

  renderCards(): JSX.Element[] {
    var cumuledHeight = 0;

    return this.state.notifications.map((n, i) => {
      var top = cumuledHeight;

      if (n.title && n.message) {
        cumuledHeight += 60 + 5;
      } else {
        cumuledHeight += 30 + 5;
      }

      return <NotificationCard model={n} key={n.id} top={top}/>;
    });
  }

  render() {
    return <BodyPortal left={'50%'} top={'10px'}>
      <div className="notifications">{this.renderCards()}</div>
    </BodyPortal>;
  }
}
