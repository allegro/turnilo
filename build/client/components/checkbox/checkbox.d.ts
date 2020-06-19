import * as React from "react";
import "./checkbox.scss";
export declare type CheckboxType = "check" | "cross" | "radio";
export interface CheckboxProps {
    selected: boolean;
    onClick?: React.MouseEventHandler<HTMLElement>;
    type?: CheckboxType;
    color?: string;
    label?: string;
    className?: string;
}
export interface CheckboxState {
}
export declare class Checkbox extends React.Component<CheckboxProps, CheckboxState> {
    static defaultProps: Partial<CheckboxProps>;
    renderIcon(): JSX.Element;
    render(): JSX.Element;
}
