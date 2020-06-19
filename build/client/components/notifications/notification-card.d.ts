import * as React from "react";
import "./notification-card.scss";
import { Notification } from "./notifications";
export interface NotificationCardProps {
    model: Notification;
    top: number;
}
export interface NotificationCardState {
    appearing?: boolean;
    disappearing?: boolean;
    hovered?: boolean;
    timerExpired?: boolean;
}
export declare class NotificationCard extends React.Component<NotificationCardProps, NotificationCardState> {
    private timeoutID;
    state: NotificationCardState;
    componentDidMount(): void;
    componentWillReceiveProps(nextProps: NotificationCardProps): void;
    appear: () => void;
    onDisappearTimerEnd: () => void;
    disappear(): void;
    removeMe(notification: Notification): void;
    componentWillUnmount(): void;
    onMouseOver: () => void;
    onMouseLeave: () => void;
    render(): JSX.Element;
}
