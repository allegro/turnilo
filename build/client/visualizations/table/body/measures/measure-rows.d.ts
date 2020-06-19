import * as d3 from "d3";
import { Datum, PseudoDatum } from "plywood";
import * as React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
interface MeasureRowsProps {
    visibleRowsIndexRange: [number, number];
    essence: Essence;
    highlightedRowIndex: number | null;
    scales: Array<d3.scale.Linear<number, number>>;
    data: PseudoDatum[];
    hoverRow?: Datum;
    cellWidth: number;
    rowWidth: number;
}
export declare const MeasureRows: React.SFC<MeasureRowsProps>;
export {};
