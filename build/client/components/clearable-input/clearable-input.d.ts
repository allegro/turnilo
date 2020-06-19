import * as React from "react";
import "./clearable-input.scss";
export interface ClearableInputProps {
    className?: string;
    type?: string;
    placeholder?: string;
    focusOnMount?: boolean;
    value: string;
    onChange: (newValue: string) => any;
    onBlur?: React.FocusEventHandler<HTMLElement>;
}
export declare const ClearableInput: React.SFC<ClearableInputProps>;
