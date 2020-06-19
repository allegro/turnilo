import * as React from "react";
import { SortDirection } from "../../../../../common/models/sort/sort";
import "./measure-header-cell.scss";
interface MeasureHeaderCellProps {
    width: number;
    title: string;
    sort: SortDirection | null;
    className?: string;
}
export declare const MeasureHeaderCell: React.SFC<MeasureHeaderCellProps>;
export {};
