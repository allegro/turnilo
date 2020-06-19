import * as React from "react";
import { SortOn } from "../../../common/models/sort-on/sort-on";
import { Sort, SortDirection } from "../../../common/models/sort/sort";
import { Unary } from "../../../common/utils/functional/functional";
export interface SortDropdownProps {
    direction: SortDirection;
    selected: SortOn;
    options: SortOn[];
    onChange: Unary<Sort, void>;
}
export declare const SortDropdown: React.SFC<SortDropdownProps>;
