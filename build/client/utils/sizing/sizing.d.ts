export interface Positioning {
    startIndex: number;
    shownColumns: number;
}
export declare function getVisibleSegments(segmentWidths: number[], offset: number, visibleSize: number): Positioning;
