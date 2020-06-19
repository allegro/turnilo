import * as React from "react";
import "./button.scss";
export declare type ButtonType = "primary" | "secondary" | "warn";
export interface ButtonProps {
    type: ButtonType;
    className?: string;
    title?: string;
    svg?: string;
    active?: boolean;
    disabled?: boolean;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}
export interface ButtonState {
}
export declare class Button extends React.Component<ButtonProps, ButtonState> {
    render(): JSX.Element;
}
