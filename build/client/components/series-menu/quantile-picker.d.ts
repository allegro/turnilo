import * as React from "react";
import { Omit } from "../../../common/utils/functional/functional";
import { InputWithPresetsProps } from "../input-with-presets/input-with-presets";
declare type QuantilePickerProps = Omit<InputWithPresetsProps<number>, "parseCustomValue" | "formatCustomValue">;
export declare const QuantilePicker: React.SFC<QuantilePickerProps>;
export {};
