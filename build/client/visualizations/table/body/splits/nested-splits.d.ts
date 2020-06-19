import { Datum, PseudoDatum } from "plywood";
import * as React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import "./nested-splits.scss";
interface NestedSplitsProps {
    visibleRowsIndexRange: [number, number];
    essence: Essence;
    data: PseudoDatum[];
    hoverRow?: Datum;
    segmentWidth: number;
    highlightedRowIndex: number | null;
}
export declare const NestedSplits: React.SFC<NestedSplitsProps>;
export {};
