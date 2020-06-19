import { Datum, PseudoDatum } from "plywood";
import * as React from "react";
import { Unary } from "../../../../common/utils/functional/functional";
interface RowProps {
    highlight: boolean;
    dimmed: boolean;
    top: number;
    index: number;
    datum: PseudoDatum;
}
interface VisibleRowsProps {
    visibleRowsIndexRange: [number, number];
    highlightedRowIndex: number | null;
    rowsData: PseudoDatum[];
    hoveredRowDatum?: Datum;
    renderRow: Unary<RowProps, JSX.Element>;
}
export declare const VisibleRows: React.SFC<VisibleRowsProps>;
export {};
