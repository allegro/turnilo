import { Datum, PseudoDatum } from "plywood";
import * as React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import "./flattened-splits.scss";
interface FlattenedSplitsProps {
    visibleRowsIndexRange: [number, number];
    essence: Essence;
    data: PseudoDatum[];
    hoverRow?: Datum;
    segmentWidth: number;
    highlightedRowIndex: number | null;
}
export declare const FlattenedSplits: React.SFC<FlattenedSplitsProps>;
export {};
