import * as React from "react";
import { Binary } from "../../../common/utils/functional/functional";
import "./string-value.scss";
interface StringValueProps {
    value: unknown;
    selected: boolean;
    checkboxStyle: string;
    highlight: string;
    onRowSelect: Binary<unknown, boolean, void>;
}
export declare const StringValue: React.SFC<StringValueProps>;
export {};
