import { Datum } from "plywood";
import * as React from "react";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Unary } from "../../../common/utils/functional/functional";
import { RowMode } from "./utils/row-mode";
interface DataRowsProps {
    rowMode: RowMode;
    data: Datum[];
    searchText: string;
    dimension: Dimension;
    formatter: Unary<Datum, string>;
}
export declare const DataRows: React.SFC<DataRowsProps>;
export {};
