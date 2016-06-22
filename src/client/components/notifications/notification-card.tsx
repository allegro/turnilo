require('./notification-card.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { classNames } from '../../utils/dom/dom';
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
}

export class NotificationCard extends React.Component<NotificationCardProps, NotificationCardState> {
  private timeoutID: number;

  constructor() {
    super();
    this.state = {appearing: false, disappearing: false};
  }

  componentDidMount() {
    this.setState({appearing: true}, () => {
      this.timeoutID = window.setTimeout(this.appear.bind(this), 10);
    });
  }

  appear() {
    const { title, message, sticky } = this.props.model;

    if (sticky) {
      this.setState({appearing: false});
      return;
    }

    this.setState({appearing: false}, () => {
      this.timeoutID = window.setTimeout(this.disappear.bind(this), title && message ? 2000 : 1000);
    });
  }

  disappear() {
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

  render() {
    const { appearing, disappearing } = this.state;
    var { model, top } = this.props;

    if (!model) return null;

    if (appearing || disappearing) top = -100;

    const height = model.title && model.message ? 60 : 30;

    return <div
      style={{top, height}}
      onClick={this.disappear.bind(this)}
      className={classNames(`notification-card ${model.priority}`, {appearing, disappearing})}
     >
      <div className="title">{model.title}</div>
      <div className="message">{model.message}</div>
    </div>;
  }
}
