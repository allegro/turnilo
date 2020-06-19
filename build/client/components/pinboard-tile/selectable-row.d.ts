import * as React from "react";
import { Unary } from "../../../common/utils/functional/functional";
import "./selectable-row.scss";
interface SelectableRowProps {
    value: unknown;
    selected: boolean;
    onSelect: Unary<unknown, void>;
    measure: string;
    searchText: string;
}
export declare const SelectableRow: React.SFC<SelectableRowProps>;
export {};
