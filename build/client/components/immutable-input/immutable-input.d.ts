import * as React from "react";
import { ChangeFn } from "../../utils/immutable-form-delegate/immutable-form-delegate";
import "./immutable-input.scss";
export declare type InputType = "text" | "textarea";
export interface ImmutableInputProps {
    instance: any;
    className?: string;
    path: string;
    focusOnStartUp?: boolean;
    onChange?: ChangeFn;
    onInvalid?: (invalidString: string) => void;
    validator?: RegExp | ((str: string) => boolean);
    stringToValue?: (str: string) => any;
    valueToString?: (value: any) => string;
    type?: InputType;
}
export interface ImmutableInputState {
    myInstance?: any;
    invalidString?: string;
    validString?: string;
}
export declare class ImmutableInput extends React.Component<ImmutableInputProps, ImmutableInputState> {
    static defaultProps: Partial<ImmutableInputProps>;
    static simpleGenerator(instance: any, changeFn: ChangeFn): (name: string, validator?: RegExp, focusOnStartUp?: boolean) => JSX.Element;
    private focusAlreadyGiven;
    private input;
    constructor(props: ImmutableInputProps);
    initFromProps(props: ImmutableInputProps): void;
    reset(callback?: () => void): void;
    componentWillReceiveProps(nextProps: ImmutableInputProps): void;
    componentDidUpdate(): void;
    componentDidMount(): void;
    maybeFocus(): void;
    isValueValid(value: string): boolean;
    update(newString: string): void;
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    render(): JSX.Element;
}
