import { Set } from "immutable";
import { Dataset } from "plywood";
import * as React from "react";
import { Dimension } from "../../../common/models/dimension/dimension";
import { FilterMode } from "../../../common/models/filter/filter";
import { Binary } from "../../../common/utils/functional/functional";
import "./string-values-list.scss";
interface RowsListProps {
    dimension: Dimension;
    dataset: Dataset;
    searchText: string;
    limit: number;
    selectedValues: Set<unknown>;
    promotedValues: Set<unknown>;
    filterMode: FilterMode;
    onRowSelect: Binary<unknown, boolean, void>;
}
export declare const StringValuesList: React.SFC<RowsListProps>;
export {};
