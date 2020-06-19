import * as React from "react";
import { Unary } from "../../../common/utils/functional/functional";
import "./input-with-presets.scss";
export interface Preset<T> {
    name: string;
    identity: T;
}
export interface InputWithPresetsProps<T> {
    presets: Array<Preset<T>>;
    selected?: T;
    onChange: Unary<T, void>;
    errorMessage?: string;
    placeholder?: string;
    title?: string;
    parseCustomValue: Unary<string, T>;
    formatCustomValue: Unary<T, string>;
}
interface InputWithPresetsState {
    customPicked: boolean;
    customValue: string;
}
export declare class InputWithPresets<T> extends React.Component<InputWithPresetsProps<T>, InputWithPresetsState> {
    initialState(): InputWithPresetsState;
    state: InputWithPresetsState;
    customValueUpdate: (e: React.ChangeEvent<HTMLInputElement>) => void;
    pickCustom: () => void;
    pickPreset: (value: T) => void;
    render(): JSX.Element;
}
export {};
