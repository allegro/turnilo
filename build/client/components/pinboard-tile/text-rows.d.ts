import { Datum } from "plywood";
import * as React from "react";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Unary } from "../../../common/utils/functional/functional";
interface TextRowsProps {
    data: Datum[];
    dimension: Dimension;
    formatter: Unary<Datum, string>;
    searchText: string;
    onClick?: Unary<unknown, void>;
}
export declare const TextRows: React.SFC<TextRowsProps>;
export {};
