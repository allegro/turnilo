import * as React from "react";
import { Unary } from "../../../common/utils/functional/functional";
import "./text-row.scss";
interface TextRowProps {
    value: unknown;
    onClick: Unary<unknown, void>;
    measure: string;
    searchText: string;
}
export declare const TextRow: React.SFC<TextRowProps>;
export {};
