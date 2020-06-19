import * as React from "react";
import { ButtonType } from "../button/button";
import "./notifications.scss";
export interface NotificationAction {
    label: string;
    callback: () => void;
}
export interface Notification {
    title: string;
    priority: string;
    message?: string;
    id?: number;
    duration?: number;
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
export declare class Notifier {
    static counter: number;
    static notifications: Notification[];
    static question: Question;
    static listeners: Array<(notifications: Notification[], question?: Question) => void>;
    private static create;
    private static callListeners;
    static info(title: string, message?: string): void;
    static failure(title: string, message?: string): void;
    static success(title: string, action?: NotificationAction): void;
    static subscribe(callback: (notifications: Notification[], question: Question) => void): void;
    static stick(text: string): number;
    static removeSticker(id: number): void;
    static ask(question: Question): void;
    static removeQuestion(): void;
    static clear(): void;
    static removeNotification(notification: Notification): void;
    static unsubscribe(callback: (notifications: Notification[], question: Question) => void): void;
}
export interface NotificationsState {
    notifications: Notification[];
}
export declare class Notifications extends React.Component<React.Props<any>, NotificationsState> {
    state: NotificationsState;
    componentDidMount(): void;
    componentWillUnmount(): void;
    onChange: (notifications: Notification[]) => void;
    renderCards(): JSX.Element[];
    render(): JSX.Element;
}
export interface QuestionsState {
    question?: Question;
}
export declare class Questions extends React.Component<React.Props<any>, QuestionsState> {
    state: QuestionsState;
    componentDidMount(): void;
    componentWillUnmount(): void;
    onChange: (notifications: Notification[], question: Question) => void;
    render(): JSX.Element;
}
