import { Datum } from "plywood";
import * as React from "react";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Unary } from "../../../common/utils/functional/functional";
import { PinnableClause } from "./utils/pinnable-clause";
interface SelectableRowsProps {
    data: Datum[];
    dimension: Dimension;
    formatter: Unary<Datum, string>;
    clause: PinnableClause;
    searchText: string;
    onSelect: Unary<unknown, void>;
}
export declare const SelectableRows: React.SFC<SelectableRowsProps>;
export {};
