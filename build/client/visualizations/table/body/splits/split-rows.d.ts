import { Datum, PseudoDatum } from "plywood";
import * as React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
interface SplitRowsProps {
    collapseRows: boolean;
    visibleRowsIndexRange: [number, number];
    essence: Essence;
    data: PseudoDatum[];
    hoverRow?: Datum;
    segmentWidth: number;
    highlightedRowIndex: number | null;
}
export declare const SplitRows: React.SFC<SplitRowsProps>;
export {};
