import { Datum, PseudoDatum } from "plywood";
import { Essence } from "../../../../common/models/essence/essence";
import { SeriesDerivation } from "../../../../common/models/series/concrete-series";
import { Series } from "../../../../common/models/series/series";
export declare enum HoverElement {
    CORNER = 0,
    ROW = 1,
    HEADER = 2,
    WHITESPACE = 3
}
interface RowHover {
    element: HoverElement.ROW;
    datum: Datum;
}
interface SeriesHover {
    element: HoverElement.HEADER;
    series: Series;
    period: SeriesDerivation;
}
interface CornerHover {
    element: HoverElement.CORNER;
}
interface WhiteSpaceHover {
    element: HoverElement.WHITESPACE;
}
export declare type PositionHover = RowHover | SeriesHover | CornerHover | WhiteSpaceHover;
export declare function seriesPosition(x: number, essence: Essence, segmentWidth: number, columnWidth: number): PositionHover;
export declare function rowPosition(y: number, data: PseudoDatum[]): PositionHover;
export {};
