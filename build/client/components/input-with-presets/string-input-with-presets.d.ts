import * as React from "react";
import { Omit } from "../../../common/utils/functional/functional";
import { InputWithPresetsProps } from "./input-with-presets";
declare type StringInputWithPresetsProps = Omit<InputWithPresetsProps<string>, "parseCustomValue" | "formatCustomValue">;
export declare const StringInputWithPresets: React.SFC<StringInputWithPresetsProps>;
export {};
