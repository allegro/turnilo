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
import { Fn } from '../../../common/utils/general/general';
import { BodyPortal, Modal, Button, ButtonType } from '../index';
import { NotificationCard } from './notification-card';

export interface NotificationAction {
  label: string;
  callback: () => void;
}

export interface Notification {
  title: string;
  priority: string;
  message?: string;
  id?: number;
  duration?: number; // seconds
  action?: NotificationAction;
  muted?: boolean;
  discarded?: boolean;
}

export interface Choice {
  label: string;
  callback: () => void;
  className?: string;
  type?: ButtonType;
}

export interface Question {
  title: string;
  message: (string | string[]);
  choices: Choice[];
  onClose?: () => void;
}

export class Notifier {
  static counter = 0;
  static notifications: Notification[] = []; // notification & stickers, really

  static question: Question = null;

  static listeners: ((notifications: Notification[], question?: Question) => void)[] = [];

  private static create(notification: Notification): number {
    notification.id = Notifier.counter++;

    Notifier.notifications.push(notification);
    Notifier.callListeners();

    return notification.id;
  }

  private static callListeners() {
    Notifier.listeners.forEach((cb) => cb(Notifier.notifications, Notifier.question));
  }

  public static info(title: string, message?: string) {
    Notifier.create({title, message, priority: 'info'});
  }

  public static failure(title: string, message?: string) {
    Notifier.create({title, message, priority: 'failure'});
  }

  public static success(title: string, action?: NotificationAction) {
    Notifier.create({title, priority: 'success', action});
  }

  public static subscribe(callback: (notifications: Notification[], question: Question) => void) {
    Notifier.listeners.push(callback);
  }

  // Stickers
  public static stick(text: string): number {
    return Notifier.create({title: text, priority: 'info', muted: true});
  }

  public static removeSticker(id: number) {
    var notification: Notification;
    var index = -1;

    Notifier.notifications.forEach((n, i) => {
      if (n.id === id) {
        notification = n;
        index = i;
      }
    });

    if (!notification) {
      console.warn('Trying to remove a non existing sticker');
      return;
    }

    notification.discarded = true;
    Notifier.notifications[index] = notification;

    Notifier.callListeners();
  }

  // Questions
  public static ask(question: Question) {
    if (Notifier.question) throw new Error('There is already a pending question');

    Notifier.question = question;

    Notifier.callListeners();
  }

  public static removeQuestion() {
    if (!Notifier.question) throw new Error('No question to remove');

    Notifier.question = undefined;

    Notifier.callListeners();
  }

  public static clear() {
    this.notifications.forEach(n => n.discarded = true);
    Notifier.callListeners();
  }

  public static removeNotification(notification: Notification) {
    const index = Notifier.notifications.indexOf(notification);

    if (index === -1) {
      throw new Error('Trying to remove an unknown notification');
    }

    Notifier.notifications.splice(index, 1);
    Notifier.listeners.forEach((cb) => cb(Notifier.notifications));
  }

  public static unsubscribe(callback: (notifications: Notification[], question: Question) => void) {
    const index = Notifier.listeners.indexOf(callback);

    if (index === -1) {
      throw new Error('Trying to unsubscribe something that never subscribed');
    }

    Notifier.listeners.splice(index, 1);
  }
}


export interface NotificationsState {
  notifications: Notification[];
}

export class Notifications extends React.Component<React.Props<any>, NotificationsState> {
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
    var cumuledHeight = 13;

    return this.state.notifications.map((n, i) => {
      const { title, message, action } = n;
      const top = cumuledHeight;

      cumuledHeight += [title, message, action].filter(Boolean).length * 30 + 5;

      return <NotificationCard model={n} key={n.id} top={top}/>;
    });
  }

  render() {
    return <BodyPortal left={'50%'} top={'10px'} isAboveAll={true}>
      <div className="notifications">{this.renderCards()}</div>
    </BodyPortal>;
  }
}


export interface QuestionsState {
  question?: Question;
}

export class Questions extends React.Component<React.Props<any>, QuestionsState> {
  constructor() {
    super();
    this.state = {};
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    Notifier.subscribe(this.onChange);
  }

  componentWillUnmount() {
    Notifier.unsubscribe(this.onChange);
  }

  onChange(notifications: Notification[], question: Question) {
    this.setState({question});
  }

  render() {
    const { question } = this.state;

    if (!question) return null;

    return <Modal
      className="remove-modal"
      title={question.title}
      onClose={question.onClose}
    >
      {Array.isArray(question.message)
        ? question.message.map((line, i) => <p key={i}>{line}</p>)
        : <p>{question.message}</p>
      }

      <div className="button-bar">
        {question.choices.map(({label, callback, type, className}, i) => {
          return <Button key={i} className={className} title={label} type={type} onClick={callback}/>;
        })}
      </div>

    </Modal>;
  }
}
